const { firestore } = require('../utils/database');
const logger = require('../utils/logger');
const crypto = require('crypto');
const config = require('../config/config');
const paymentNotificationService = require('../services/paymentNotificationService');

/**
 * Handle LNBits webhook for payment confirmations
 * This ensures payments are automatically credited to user accounts
 */
const handleLNBitsWebhook = async (req, res) => {
  try {
    console.log('LNBits webhook received:', req.body);

    // Verify webhook signature if configured
    if (config.lnbits.webhookSecret) {
      const signature = req.headers['x-lnbits-signature'];
      if (
        !verifyWebhookSignature(
          req.body,
          signature,
          config.lnbits.webhookSecret
        )
      ) {
        logger.error('Invalid webhook signature');
        return res.status(401).json({ error: 'Invalid signature' });
      }
    }

    // Acknowledge receipt immediately
    res.status(200).json({ status: 'received' });

    // Process webhook asynchronously
    await processLNBitsPayment(req.body);
  } catch (error) {
    console.error('LNBits webhook error:', error);
    logger.error('LNBits webhook error:', error);
    // Still return 200 to prevent webhook retries
    res.status(200).json({ status: 'error', message: error.message });
  }
};

/**
 * Process LNBits payment webhook
 */
const processLNBitsPayment = async (webhookData) => {
  try {
    const { payment_hash, amount, memo, paid, pending } = webhookData;

    console.log('Processing LNBits payment:', {
      payment_hash,
      amount,
      paid,
      pending,
    });

    // Only process if payment is confirmed
    if (!paid || pending) {
      console.log('Payment not confirmed yet, skipping');
      return;
    }

    // Find the invoice in our database
    const invoicesSnapshot = await firestore
      .collection('invoices')
      .where('paymentHash', '==', payment_hash)
      .limit(1)
      .get();

    if (invoicesSnapshot.empty) {
      logger.error('Invoice not found for payment hash:', payment_hash);
      return;
    }

    const invoiceDoc = invoicesSnapshot.docs[0];
    const invoice = invoiceDoc.data();

    // Check if already processed
    if (invoice.status === 'paid') {
      console.log('Invoice already processed:', payment_hash);
      return;
    }

    console.log('Processing payment for invoice:', {
      invoiceId: invoiceDoc.id,
      userId: invoice.userId,
      amount: invoice.amount,
      parentId: invoice.parentId,
    });

    // Use Firestore transaction for atomic updates
    await firestore.runTransaction(async (transaction) => {
      // Update invoice status
      transaction.update(invoiceDoc.ref, {
        status: 'paid',
        paidAt: new Date(),
        webhookProcessedAt: new Date(),
      });

      // Update user balance - FIXED: Always update children collection for child accounts
      if (invoice.parentId) {
        // Parent-created invoice for child account
        const childRef = firestore.collection('children').doc(invoice.userId);
        transaction.update(childRef, {
          balance: firestore.FieldValue.increment(invoice.amount),
        });
      } else {
        // Child-created invoice - also update children collection
        const childRef = firestore.collection('children').doc(invoice.userId);
        transaction.update(childRef, {
          balance: firestore.FieldValue.increment(invoice.amount),
        });
      }

      // Record transaction
      const transactionRef = firestore.collection('transactions').doc();
      transaction.set(transactionRef, {
        userId: invoice.userId,
        parentId: invoice.parentId,
        type: 'deposit',
        source: 'lightning',
        amount: invoice.amount,
        description: invoice.memo,
        paymentHash: payment_hash,
        timestamp: new Date(),
        processedVia: 'webhook',
      });
    });

    console.log('Payment processed successfully:', payment_hash);

    // Send real-time notification to user
    try {
      await paymentNotificationService.notifyPaymentReceived(invoice);
      await sendPaymentNotification(invoice);
    } catch (notificationError) {
      console.error('Failed to send notification:', notificationError);
    }
  } catch (error) {
    console.error('Error processing LNBits payment:', error);
    logger.error('Error processing LNBits payment:', error);
    throw error;
  }
};

/**
 * Verify webhook signature
 */
const verifyWebhookSignature = (payload, signature, secret) => {
  if (!signature || !secret) return false;

  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  return crypto.timingSafeEqual(
    Buffer.from(signature, 'hex'),
    Buffer.from(expectedSignature, 'hex')
  );
};

/**
 * Send payment notification
 */
const sendPaymentNotification = async (invoice) => {
  try {
    // You can implement SMS, email, or push notifications here
    console.log('Payment notification sent for invoice:', invoice.userId);
  } catch (error) {
    console.error('Notification error:', error);
  }
};

/**
 * Test webhook endpoint
 */
const testWebhook = async (req, res) => {
  res.json({
    status: 'ok',
    message: 'LNBits webhook endpoint is working',
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  handleLNBitsWebhook,
  testWebhook,
};
