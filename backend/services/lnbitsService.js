const axios = require('axios');
const config = require('../config/config');
const logger = require('../utils/logger');
const qrcode = require('qrcode');

class LNBitsService {
  constructor() {
    this.baseUrl = config.lnbits.baseUrl || 'https://demo.lnbits.com/api/v1';
    this.adminKey = config.lnbits.adminKey;
    this.invoiceKey = config.lnbits.invoiceKey;
    this.walletId = config.lnbits.walletId;
    this.webhookUrl = config.lnbits.webhookUrl;
    this.environment = config.lnbits.environment;
    this.timeout = config.lnbits.timeout;
    this.retryAttempts = config.lnbits.retryAttempts;
    this.retryDelay = config.lnbits.retryDelay;

    // Validate required configuration for production
    this.validateConfiguration();

    // Configure axios instance with timeout and interceptors
    this.axiosInstance = axios.create({
      timeout: this.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for logging
    this.axiosInstance.interceptors.request.use(
      (config) => {
        logger.info('LNBits API Request:', {
          method: config.method,
          url: config.url,
          data: config.data ? 'present' : 'none',
        });
        return config;
      },
      (error) => {
        logger.error('LNBits Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Add response interceptor for logging
    this.axiosInstance.interceptors.response.use(
      (response) => {
        logger.info('LNBits API Response:', {
          status: response.status,
          url: response.config.url,
        });
        return response;
      },
      (error) => {
        logger.error('LNBits Response Error:', {
          status: error.response?.status,
          url: error.config?.url,
          message: error.message,
          data: error.response?.data,
        });
        return Promise.reject(error);
      }
    );

    logger.info('LNBits service initialized', {
      baseUrl: this.baseUrl,
      environment: this.environment,
      walletId: this.walletId ? 'configured' : 'missing',
      webhookUrl: this.webhookUrl ? 'configured' : 'missing',
    });
  }

  validateConfiguration() {
    const requiredFields = ['adminKey', 'invoiceKey', 'walletId'];
    const missingFields = requiredFields.filter((field) => !this[field]);

    if (missingFields.length > 0 && this.environment === 'production') {
      throw new Error(
        `Missing required LNBits configuration for production: ${missingFields.join(
          ', '
        )}`
      );
    }

    if (missingFields.length > 0) {
      logger.warn('Missing LNBits configuration fields:', missingFields);
      logger.warn('Using demo configuration - not suitable for production');
    }

    // Validate webhook URL format if provided
    if (this.webhookUrl && !this.webhookUrl.startsWith('http')) {
      throw new Error(
        'Invalid webhook URL format. Must start with http:// or https://'
      );
    }
  }

  async getWalletInfo() {
    try {
      const response = await axios.get(`${this.baseUrl}/wallet`, {
        headers: {
          'X-Api-Key': this.invoiceKey,
          'Content-Type': 'application/json',
        },
      });

      return {
        ...response.data,
        adminkey: this.adminKey,
        inkey: this.invoiceKey,
      };
    } catch (error) {
      logger.error('LNBits wallet info error:', error);
      throw new Error(`Failed to get wallet info: ${error.message}`);
    }
  }

  async getWalletBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/wallet`, {
        headers: {
          'X-Api-Key': this.invoiceKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data.balance;
    } catch (error) {
      logger.error('LNBits balance check error:', error);
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  async createInvoice(invoiceKey, amount, memo) {
    try {
      // Validate amount
      if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('Amount must be a positive integer');
      }

      console.log(`Creating invoice for ${amount} sats with memo: ${memo}`);

      // Use provided invoiceKey if available, otherwise fall back to the default
      const apiKey = invoiceKey || this.invoiceKey;
      if (!apiKey) {
        throw new Error('No invoice key provided');
      }

      // Prepare invoice data
      const invoiceData = {
        out: false,
        amount,
        memo: memo || 'Sats Jar Junior deposit',
      };

      // Add webhook URL if configured
      if (this.webhookUrl) {
        invoiceData.webhook = this.webhookUrl;
        console.log('Adding webhook URL to invoice:', this.webhookUrl);
      }

      const response = await axios.post(
        `${this.baseUrl}/payments`,
        invoiceData,
        {
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Invoice API response:', JSON.stringify(response.data));

      // Generate QR code for the payment request if it exists
      let qrCodeDataURL = null;
      if (response.data?.bolt11) {
        try {
          qrCodeDataURL = await qrcode.toDataURL(response.data.bolt11);
          console.log('QR code generated successfully');
        } catch (qrError) {
          console.error('QR code generation error:', qrError);
          // Continue without QR code
        }
      } else {
        console.warn('No bolt11 in response data');
      }

      return {
        ...response.data,
        payment_request: response.data.bolt11, // Map bolt11 to payment_request
        qrCode: qrCodeDataURL,
      };
    } catch (error) {
      console.error('LNBits invoice creation error:', error.stack);
      logger.error('LNBits invoice creation error:', error);
      throw new Error(
        `Failed to create Lightning invoice: ${
          error.response?.data?.detail || error.message
        }`
      );
    }
  }

  async generateQRCode(data) {
    if (!data || typeof data !== 'string') {
      throw new Error('Valid string data required for QR code generation');
    }

    try {
      return await qrcode.toDataURL(data);
    } catch (error) {
      logger.error('QR code generation error:', error);
      throw new Error(`Failed to generate QR code: ${error.message}`);
    }
  }

  async checkInvoiceStatus(paymentHash, invoiceKey = null) {
    try {
      console.log('Checking invoice status for payment hash:', paymentHash);
      console.log(
        'Using LNBits URL:',
        `${this.baseUrl}/payments/${paymentHash}`
      );

      // Use provided invoiceKey if available, otherwise fall back to default
      const apiKey = invoiceKey || this.invoiceKey;
      console.log('Using invoice key:', apiKey ? 'configured' : 'missing');

      const response = await axios.get(
        `${this.baseUrl}/payments/${paymentHash}`,
        {
          headers: {
            'X-Api-Key': apiKey,
            'Content-Type': 'application/json',
          },
          timeout: 30000, // 30 second timeout
        }
      );

      console.log('LNBits invoice status response:', response.data);
      return response.data;
    } catch (error) {
      console.error('LNBits invoice status check error:', {
        paymentHash,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
      });

      logger.error('LNBits invoice status check error:', error);

      // Provide more specific error messages
      if (error.response?.status === 404) {
        throw new Error(`Invoice not found in LNBits: ${paymentHash}`);
      } else if (
        error.response?.status === 401 ||
        error.response?.status === 403
      ) {
        throw new Error('Invalid LNBits API key or insufficient permissions');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('Cannot connect to LNBits server');
      } else {
        throw new Error(
          `Failed to check invoice status: ${
            error.response?.data?.detail || error.message
          }`
        );
      }
    }
  }

  async payInvoice(bolt11) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          out: true,
          bolt11,
        },
        {
          headers: {
            'X-Api-Key': this.adminKey,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    } catch (error) {
      logger.error('LNBits payment error:', error);
      throw new Error(`Failed to pay Lightning invoice: ${error.message}`);
    }
  }

  // Get wallet balance
  async getWalletBalance() {
    try {
      const response = await axios.get(`${this.baseUrl}/wallet`, {
        headers: {
          'X-Api-Key': this.adminKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      logger.error('LNBits wallet balance error:', error);
      throw new Error(`Failed to get wallet balance: ${error.message}`);
    }
  }

  // Get wallet transactions
  async getWalletTransactions() {
    try {
      const response = await axios.get(`${this.baseUrl}/payments`, {
        headers: {
          'X-Api-Key': this.adminKey,
          'Content-Type': 'application/json',
        },
      });
      return response.data;
    } catch (error) {
      logger.error('LNBits wallet transactions error:', error);
      throw new Error(`Failed to get wallet transactions: ${error.message}`);
    }
  }

  // Withdraw funds from LNBits wallet to external Lightning address
  async withdrawFunds(bolt11Invoice) {
    try {
      console.log('Withdrawing funds via Lightning invoice:', bolt11Invoice);

      const response = await axios.post(
        `${this.baseUrl}/payments`,
        {
          out: true,
          bolt11: bolt11Invoice,
        },
        {
          headers: {
            'X-Api-Key': this.adminKey,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Withdrawal successful:', response.data);
      return response.data;
    } catch (error) {
      logger.error('LNBits withdrawal error:', error);
      throw new Error(`Failed to withdraw funds: ${error.message}`);
    }
  }
}

module.exports = new LNBitsService();
