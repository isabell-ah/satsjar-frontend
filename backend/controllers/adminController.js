const lightningService = require('../services/lightningService');
const logger = require('../utils/logger');

/**
 * Get Lightning wallet balance and info
 * This shows you how much money is in your Lightning wallet
 */
const getWalletInfo = async (req, res) => {
  try {
    console.log('Getting Lightning wallet information...');

    // Get wallet balance
    const walletInfo = await lightningService.getBalance();

    // Get recent transactions (if supported by provider)
    let transactions = [];
    try {
      transactions = (await lightningService.getTransactions)
        ? await lightningService.getTransactions()
        : [];
    } catch (error) {
      console.log(
        'Transactions not supported by current provider:',
        error.message
      );
    }

    // Calculate totals
    const totalReceived = transactions
      .filter((tx) => !tx.out && tx.paid)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const totalSent = transactions
      .filter((tx) => tx.out && tx.paid)
      .reduce((sum, tx) => sum + tx.amount, 0);

    const response = {
      wallet: {
        id: walletInfo.id,
        name: walletInfo.name,
        balance: walletInfo.balance, // Current balance in satoshis
        balanceBTC: (walletInfo.balance / 100000000).toFixed(8), // Convert to BTC
      },
      statistics: {
        totalReceived,
        totalSent,
        netBalance: totalReceived - totalSent,
        transactionCount: transactions.length,
      },
      recentTransactions: transactions.slice(0, 10), // Last 10 transactions
    };

    console.log('Wallet info retrieved:', {
      balance: walletInfo.balance,
      transactionCount: transactions.length,
    });

    res.json(response);
  } catch (error) {
    console.error('Get wallet info error:', error);
    logger.error('Get wallet info error:', error);
    res.status(500).json({
      error: 'Failed to get wallet information',
      details: error.message,
    });
  }
};

/**
 * Withdraw funds from LNBits wallet to your personal Lightning wallet
 * Use this to move money from LNBits to your own wallet
 */
const withdrawFunds = async (req, res) => {
  try {
    const { bolt11Invoice, amount } = req.body;

    if (!bolt11Invoice) {
      return res.status(400).json({
        error: 'Lightning invoice (bolt11) is required',
      });
    }

    console.log('Initiating withdrawal:', {
      amount: amount || 'amount from invoice',
      invoiceLength: bolt11Invoice.length,
    });

    // Withdraw funds using the Lightning invoice
    const lightningService = require('../services/lightningService');
    const result = await lightningService.createWithdrawal(bolt11Invoice);

    console.log('Withdrawal completed:', result);

    res.json({
      success: true,
      message: 'Withdrawal initiated successfully',
      paymentHash: result.payment_hash,
      amount: result.amount || amount,
    });
  } catch (error) {
    console.error('Withdrawal error:', error);
    logger.error('Withdrawal error:', error);
    res.status(500).json({
      error: 'Failed to withdraw funds',
      details: error.message,
    });
  }
};

/**
 * Get detailed transaction history
 */
const getTransactionHistory = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    console.log('Getting transaction history...');

    const lightningService = require('../services/lightningService');
    const transactions = await lightningService.getTransactions();

    // Sort by timestamp (newest first)
    const sortedTransactions = transactions
      .sort((a, b) => new Date(b.time * 1000) - new Date(a.time * 1000))
      .slice(offset, offset + parseInt(limit));

    const formattedTransactions = sortedTransactions.map((tx) => ({
      id: tx.payment_hash,
      type: tx.out ? 'outgoing' : 'incoming',
      amount: tx.amount,
      amountBTC: (tx.amount / 100000000).toFixed(8),
      status: tx.paid ? 'completed' : 'pending',
      memo: tx.memo || '',
      timestamp: new Date(tx.time * 1000).toISOString(),
      fee: tx.fee || 0,
    }));

    res.json({
      transactions: formattedTransactions,
      total: transactions.length,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (error) {
    console.error('Get transaction history error:', error);
    logger.error('Get transaction history error:', error);
    res.status(500).json({
      error: 'Failed to get transaction history',
      details: error.message,
    });
  }
};

/**
 * Create a withdrawal invoice for yourself
 * This helps you create an invoice to withdraw funds to your personal wallet
 */
const createWithdrawalInvoice = async (req, res) => {
  try {
    const { amount, memo } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        error: 'Valid amount is required',
      });
    }

    console.log('Creating withdrawal invoice for admin:', {
      amount,
      memo: memo || 'Admin withdrawal',
    });

    // Create an invoice that you can pay from your personal wallet
    // This will move funds from your Lightning provider to your personal Lightning wallet
    const lightningService = require('../services/lightningService');
    const invoice = await lightningService.createInvoice(
      null, // Use default invoice key
      amount,
      memo || 'Admin withdrawal from Lightning wallet'
    );

    res.json({
      paymentRequest: invoice.payment_request,
      paymentHash: invoice.payment_hash,
      amount,
      qrCode: invoice.qrCode,
      instructions: [
        '1. Copy the payment request (bolt11 invoice)',
        '2. Open your personal Lightning wallet',
        '3. Pay this invoice to withdraw funds from LNBits',
        '4. Funds will be transferred to your personal wallet',
      ],
    });
  } catch (error) {
    console.error('Create withdrawal invoice error:', error);
    logger.error('Create withdrawal invoice error:', error);
    res.status(500).json({
      error: 'Failed to create withdrawal invoice',
      details: error.message,
    });
  }
};

module.exports = {
  getWalletInfo,
  withdrawFunds,
  getTransactionHistory,
  createWithdrawalInvoice,
};
