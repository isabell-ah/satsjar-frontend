/**
 * Lightning Service Factory
 * Provides unified interface for different Lightning providers (LNBits, OpenNode)
 */

const lnbitsService = require('./lnbitsService');
const openNodeService = require('./openNodeService');
const logger = require('../utils/logger');

class LightningService {
  constructor() {
    this.provider = process.env.LIGHTNING_PROVIDER || 'lnbits';
    this.activeService = this.getActiveService();

    logger.info('Lightning service initialized', {
      provider: this.provider,
      service: 'sats-jar-api',
    });
  }

  /**
   * Get the active Lightning service based on configuration
   * @returns {Object} Active Lightning service
   */
  getActiveService() {
    switch (this.provider.toLowerCase()) {
      case 'opennode':
        return openNodeService;
      case 'lnbits':
        return lnbitsService;
      default:
        logger.warn('Unknown Lightning provider, defaulting to LNBits', {
          provider: this.provider,
          service: 'sats-jar-api',
        });
        return lnbitsService;
    }
  }

  /**
   * Switch Lightning provider at runtime
   * @param {string} newProvider - 'lnbits' or 'opennode'
   */
  switchProvider(newProvider) {
    logger.info('Switching Lightning provider', {
      from: this.provider,
      to: newProvider,
      service: 'sats-jar-api',
    });

    this.provider = newProvider;
    this.activeService = this.getActiveService();
  }

  /**
   * Create a Lightning invoice
   * @param {string} userId - User ID (optional for some providers)
   * @param {number} amount - Amount in satoshis
   * @param {string} memo - Invoice description
   * @returns {Promise<Object>} Invoice data
   */
  async createInvoice(userId, amount, memo) {
    try {
      logger.info('Creating Lightning invoice', {
        provider: this.provider,
        amount,
        memo,
        service: 'sats-jar-api',
      });

      let invoice;

      if (this.provider === 'opennode') {
        // OpenNode doesn't need userId parameter
        invoice = await this.activeService.createInvoice(amount, memo, userId);
      } else {
        // LNBits uses userId parameter
        invoice = await this.activeService.createInvoice(userId, amount, memo);
      }

      logger.info('Lightning invoice created successfully', {
        provider: this.provider,
        invoiceId: invoice.id || invoice.payment_hash,
        amount,
        service: 'sats-jar-api',
      });

      return invoice;
    } catch (error) {
      logger.error('Failed to create Lightning invoice', {
        provider: this.provider,
        error: error.message,
        amount,
        memo,
        service: 'sats-jar-api',
      });

      // Auto-fallback to alternative provider if configured
      // NOTE: Fallback disabled for production to avoid wallet split issues
      // Money would go to different wallets depending on which provider is used
      if (
        process.env.ENABLE_LIGHTNING_FALLBACK === 'true' &&
        this.provider === 'lnbits' &&
        process.env.OPENNODE_API_KEY
      ) {
        logger.info('Attempting fallback to OpenNode', {
          service: 'sats-jar-api',
        });
        logger.warn('FALLBACK ACTIVE: Payments will go to different wallet!', {
          service: 'sats-jar-api',
        });
        try {
          const fallbackInvoice = await openNodeService.createInvoice(
            amount,
            memo,
            userId
          );
          logger.info('Fallback to OpenNode successful', {
            service: 'sats-jar-api',
          });
          logger.warn(
            'Payment will go to OpenNode wallet instead of LNBits wallet',
            { service: 'sats-jar-api' }
          );
          return fallbackInvoice;
        } catch (fallbackError) {
          logger.error('Fallback to OpenNode failed', {
            error: fallbackError.message,
            service: 'sats-jar-api',
          });
        }
      }

      throw error;
    }
  }

  /**
   * Check invoice status
   * @param {string} invoiceId - Invoice ID or payment hash
   * @returns {Promise<Object>} Invoice status
   */
  async getInvoiceStatus(invoiceId) {
    try {
      logger.info('Checking Lightning invoice status', {
        provider: this.provider,
        invoiceId,
        service: 'sats-jar-api',
      });

      let status;

      if (this.provider === 'opennode') {
        status = await this.activeService.getInvoiceStatus(invoiceId);
      } else {
        // LNBits might have different method name
        status = (await this.activeService.getPaymentStatus)
          ? await this.activeService.getPaymentStatus(invoiceId)
          : await this.activeService.getInvoiceStatus(invoiceId);
      }

      return status;
    } catch (error) {
      logger.error('Failed to get Lightning invoice status', {
        provider: this.provider,
        error: error.message,
        invoiceId,
        service: 'sats-jar-api',
      });
      throw error;
    }
  }

  /**
   * Create withdrawal/payout
   * @param {string} bolt11Invoice - Lightning invoice to pay
   * @returns {Promise<Object>} Withdrawal result
   */
  async createWithdrawal(bolt11Invoice) {
    try {
      logger.info('Creating Lightning withdrawal', {
        provider: this.provider,
        invoice: bolt11Invoice.substring(0, 50) + '...',
        service: 'sats-jar-api',
      });

      let withdrawal;

      if (this.provider === 'opennode') {
        withdrawal = await this.activeService.createWithdrawal(bolt11Invoice);
      } else {
        // LNBits uses withdrawFunds method
        withdrawal = (await this.activeService.withdrawFunds)
          ? await this.activeService.withdrawFunds(bolt11Invoice)
          : await this.activeService.createWithdrawal(bolt11Invoice);
      }

      logger.info('Lightning withdrawal created successfully', {
        provider: this.provider,
        withdrawalId: withdrawal.id,
        service: 'sats-jar-api',
      });

      return withdrawal;
    } catch (error) {
      logger.error('Failed to create Lightning withdrawal', {
        provider: this.provider,
        error: error.message,
        service: 'sats-jar-api',
      });
      throw error;
    }
  }

  /**
   * Get wallet balance
   * @returns {Promise<Object>} Wallet balance
   */
  async getBalance() {
    try {
      logger.info('Getting Lightning wallet balance', {
        provider: this.provider,
        service: 'sats-jar-api',
      });

      let balance;

      if (this.provider === 'opennode') {
        balance = await this.activeService.getBalance();
      } else {
        // LNBits uses getWalletBalance method
        balance = await this.activeService.getWalletBalance();
      }

      return balance;
    } catch (error) {
      logger.error('Failed to get Lightning wallet balance', {
        provider: this.provider,
        error: error.message,
        service: 'sats-jar-api',
      });
      throw error;
    }
  }

  /**
   * Get transaction history
   * @returns {Promise<Array>} Transaction history
   */
  async getTransactions() {
    try {
      logger.info('Getting transaction history', {
        provider: this.provider,
        service: 'sats-jar-api',
      });

      if (this.provider === 'opennode') {
        // OpenNode doesn't have a direct transaction history method
        // Return empty array for now - transactions are tracked in database
        logger.warn('OpenNode transaction history not implemented', {
          service: 'sats-jar-api',
        });
        return [];
      } else {
        // LNBits has transaction history
        return await this.activeService.getWalletTransactions();
      }
    } catch (error) {
      logger.error('Failed to get transaction history', {
        error: error.message,
        provider: this.provider,
        service: 'sats-jar-api',
      });
      throw new Error(`Failed to get transactions: ${error.message}`);
    }
  }

  /**
   * Get current provider info
   * @returns {Object} Provider information
   */
  getProviderInfo() {
    return {
      provider: this.provider,
      service: this.activeService.constructor.name,
      available: {
        lnbits: !!process.env.LNBITS_BASE_URL,
        opennode: !!process.env.OPENNODE_API_KEY,
      },
    };
  }
}

module.exports = new LightningService();
