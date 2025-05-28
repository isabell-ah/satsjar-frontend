const { BreezSDK } = require('@breeztech/sdk');
const config = require('../config/config');
const logger = require('../utils/logger');
const qrcode = require('qrcode');

class BreezService {
  constructor() {
    this.sdk = null;
    this.initialized = false;
    this.init();
  }

  async init() {
    try {
      // Initialize Breez SDK with your API key
      this.sdk = await BreezSDK.connect(config.breez.apiKey, {
        // Configure default network (mainnet or testnet)
        network: config.breez.network || 'testnet'
      });
      this.initialized = true;
      logger.info('Breez SDK initialized successfully');
    } catch (error) {
      logger.error('Breez SDK initialization error:', error);
      throw error;
    }
  }

  async createWallet(userId) {
    try {
      const nodeInfo = await this.sdk.nodeInfo();
      return {
        walletId: nodeInfo.id,
        userId
      };
    } catch (error) {
      logger.error('Breez wallet creation error:', error);
      throw new Error(`Failed to create Breez wallet: ${error.message}`);
    }
  }

  async createInvoice(amount, memo) {
    try {
      if (!this.initialized) await this.init();
      
      const invoice = await this.sdk.receivePayment({
        amountSats: amount,
        description: memo || 'Sats Jar Junior deposit'
      });

      // Generate QR code
      const qrCodeDataURL = await qrcode.toDataURL(invoice.bolt11);
      
      return {
        paymentHash: invoice.paymentHash,
        bolt11: invoice.bolt11,
        payment_request: invoice.bolt11,
        qrCode: qrCodeDataURL
      };
    } catch (error) {
      logger.error('Breez invoice creation error:', error);
      throw new Error(`Failed to create Lightning invoice: ${error.message}`);
    }
  }

  async checkInvoiceStatus(paymentHash) {
    try {
      if (!this.initialized) await this.init();
      
      const payments = await this.sdk.listPayments();
      const payment = payments.find(p => p.paymentHash === paymentHash);
      
      return {
        paid: payment?.status === 'SUCCEEDED',
        details: payment
      };
    } catch (error) {
      logger.error('Breez payment status check error:', error);
      throw new Error(`Failed to check payment status: ${error.message}`);
    }
  }

  async getBalance() {
    try {
      if (!this.initialized) await this.init();
      
      const nodeInfo = await this.sdk.nodeInfo();
      return {
        balance: nodeInfo.channelsBalanceSat,
        currency: 'sats'
      };
    } catch (error) {
      logger.error('Breez balance check error:', error);
      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }
}

module.exports = new BreezService();