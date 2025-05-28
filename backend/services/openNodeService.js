/**
 * OpenNode Lightning Network Service
 * Provides Lightning Network functionality using OpenNode API
 */

const axios = require('axios');
const logger = require('../utils/logger');

class OpenNodeService {
  constructor() {
    this.baseUrl =
      process.env.OPENNODE_BASE_URL || 'https://api.opennode.com/v1';
    this.apiKey = process.env.OPENNODE_API_KEY;
    this.environment = process.env.OPENNODE_ENVIRONMENT || 'dev'; // 'dev' or 'live'

    if (!this.apiKey) {
      logger.warn('OpenNode API key not configured');
    }

    // Configure axios instance
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        Authorization: this.apiKey,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    logger.info('OpenNode service initialized', {
      baseUrl: this.baseUrl,
      environment: this.environment,
      service: 'sats-jar-api',
    });
  }

  /**
   * Create a Lightning invoice
   * @param {number} amount - Amount in satoshis
   * @param {string} description - Invoice description
   * @param {string} orderId - Optional order ID
   * @returns {Promise<Object>} Invoice data
   */
  async createInvoice(amount, description, orderId = null) {
    try {
      logger.info('Creating OpenNode invoice', {
        amount,
        description,
        orderId,
      });

      const payload = {
        amount: amount,
        description: description,
        currency: 'BTC',
        callback_url: process.env.OPENNODE_WEBHOOK_URL,
        success_url: process.env.OPENNODE_SUCCESS_URL,
        auto_settle: false, // Keep in BTC, don't convert to fiat
      };

      if (orderId) {
        payload.order_id = orderId;
      }

      const response = await this.client.post('/charges', payload);

      // Debug: Log the full response to see what OpenNode returns
      logger.info('OpenNode full response', {
        chargeId: response.data.data.id,
        lightningInvoice: response.data.data.lightning_invoice,
        service: 'sats-jar-api',
      });

      logger.info('OpenNode invoice created successfully', {
        chargeId: response.data.data.id,
        amount: amount,
        service: 'sats-jar-api',
      });

      // Extract payment hash from the Lightning invoice (bolt11)
      const lightningInvoice = response.data.data.lightning_invoice;
      const paymentRequest = lightningInvoice.payreq;

      // Extract payment hash from bolt11 invoice if not provided directly
      let paymentHash = lightningInvoice.payment_hash;
      if (!paymentHash && paymentRequest) {
        // Extract payment hash from bolt11 invoice
        try {
          const bolt11 = require('bolt11');
          const decoded = bolt11.decode(paymentRequest);

          // Payment hash is in the tags array
          const paymentHashTag = decoded.tags?.find(
            (tag) => tag.tagName === 'payment_hash'
          );
          if (paymentHashTag) {
            paymentHash = paymentHashTag.data;
            logger.info('Extracted payment hash from bolt11', {
              paymentHash,
              service: 'sats-jar-api',
            });
          } else {
            logger.warn('No payment_hash tag found in bolt11', {
              service: 'sats-jar-api',
            });
            // Use charge ID as fallback
            paymentHash = response.data.data.id;
          }
        } catch (decodeError) {
          logger.warn('Could not decode payment hash from bolt11', {
            error: decodeError.message,
            service: 'sats-jar-api',
          });
          // Use charge ID as fallback
          paymentHash = response.data.data.id;
        }
      }

      return {
        id: response.data.data.id,
        payment_request: paymentRequest,
        payment_hash: paymentHash,
        amount: amount,
        description: description,
        status: 'pending',
        expires_at: lightningInvoice.expires_at,
        created_at: response.data.data.created_at,
      };
    } catch (error) {
      logger.error('Failed to create OpenNode invoice', {
        error: error.message,
        amount,
        description,
        service: 'sats-jar-api',
      });
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  }

  /**
   * Check invoice status
   * @param {string} chargeId - OpenNode charge ID
   * @returns {Promise<Object>} Invoice status
   */
  async getInvoiceStatus(chargeId) {
    try {
      logger.info('Checking OpenNode invoice status', { chargeId });

      const response = await this.client.get(`/charge/${chargeId}`);
      const charge = response.data.data;

      return {
        id: charge.id,
        status: charge.status, // 'unpaid', 'paid', 'expired'
        paid: charge.status === 'paid', // Boolean flag for easier checking
        amount: charge.amount,
        paid_at: charge.paid_at,
        expires_at: charge.lightning_invoice?.expires_at,
        payment_hash: charge.lightning_invoice?.payment_hash,
      };
    } catch (error) {
      logger.error('Failed to get OpenNode invoice status', {
        error: error.message,
        chargeId,
        service: 'sats-jar-api',
      });
      throw new Error(`Failed to get invoice status: ${error.message}`);
    }
  }

  /**
   * Create a Lightning withdrawal (payout)
   * @param {string} bolt11Invoice - Lightning invoice to pay
   * @returns {Promise<Object>} Withdrawal result
   */
  async createWithdrawal(bolt11Invoice) {
    try {
      logger.info('Creating OpenNode withdrawal', {
        invoice: bolt11Invoice.substring(0, 50) + '...',
      });

      const payload = {
        type: 'ln',
        address: bolt11Invoice,
        callback_url: process.env.OPENNODE_WEBHOOK_URL,
      };

      const response = await this.client.post('/withdrawals', payload);

      logger.info('OpenNode withdrawal created successfully', {
        withdrawalId: response.data.data.id,
        service: 'sats-jar-api',
      });

      return {
        id: response.data.data.id,
        status: response.data.data.status,
        amount: response.data.data.amount,
        fee: response.data.data.fee,
        created_at: response.data.data.created_at,
      };
    } catch (error) {
      logger.error('Failed to create OpenNode withdrawal', {
        error: error.message,
        status: error.response?.status,
        service: 'sats-jar-api',
      });

      // Handle permission errors gracefully
      if (error.response?.status === 403) {
        logger.warn('OpenNode API key lacks withdrawal permissions', {
          service: 'sats-jar-api',
        });

        throw new Error(
          'Withdrawal failed: API key lacks withdrawal permissions. Please update your OpenNode API key with withdrawal permissions or perform withdrawals manually via OpenNode dashboard.'
        );
      }

      throw new Error(`Failed to create withdrawal: ${error.message}`);
    }
  }

  /**
   * Get account balance
   * @returns {Promise<Object>} Account balance
   */
  async getBalance() {
    try {
      logger.info('Getting OpenNode account balance');

      const response = await this.client.get('/account/balance');
      const balance = response.data.data;

      // OpenNode returns balance in different format: { balance: { BTC: 68 } }
      const btcBalance = balance.balance?.BTC || balance.BTC || 0;

      return {
        balance: btcBalance,
        currency: 'BTC',
        available: btcBalance,
        pending: 0, // OpenNode doesn't separate pending in this format
      };
    } catch (error) {
      logger.error('Failed to get OpenNode balance', {
        error: error.message,
        status: error.response?.status,
        service: 'sats-jar-api',
      });

      // Handle permission errors gracefully
      if (error.response?.status === 403) {
        logger.warn('OpenNode API key lacks balance permissions', {
          service: 'sats-jar-api',
        });

        // Return a mock balance response indicating limited permissions
        return {
          balance: 'unavailable',
          currency: 'BTC',
          available: 'unavailable',
          pending: 'unavailable',
          error: 'API key lacks balance permissions',
          message: 'Balance checking disabled due to API key limitations',
        };
      }

      throw new Error(`Failed to get balance: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   * @param {string} payload - Webhook payload
   * @param {string} signature - Webhook signature
   * @returns {boolean} Is signature valid
   */
  validateWebhook(payload, signature) {
    // OpenNode webhook validation logic
    // This would need to be implemented based on OpenNode's webhook documentation
    return true; // Placeholder
  }
}

module.exports = new OpenNodeService();
