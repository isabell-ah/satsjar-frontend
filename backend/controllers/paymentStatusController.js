const { firestore, FieldValue } = require('../utils/database');
const lightningService = require('../services/lightningService');
const logger = require('../utils/logger');

/**
 * Enhanced payment status checking with automatic processing
 * This replaces manual "Check Payment" with automatic detection
 */
const checkPaymentStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { paymentHash } = req.params;

    console.log('Enhanced payment status check:', {
      userId,
      userRole,
      paymentHash,
    });

    // Find invoice in database
    const invoicesSnapshot = await firestore
      .collection('invoices')
      .where('paymentHash', '==', paymentHash)
      .limit(1)
      .get();

    if (invoicesSnapshot.empty) {
      console.error('Invoice not found:', paymentHash);
      return res.status(404).json({ error: 'Invoice not found' });
    }

    const invoiceDoc = invoicesSnapshot.docs[0];
    const invoice = invoiceDoc.data();

    // Check permissions
    if (invoice.userId !== userId && invoice.parentId !== userId) {
      console.error('Permission denied for invoice:', {
        userId,
        invoiceUserId: invoice.userId,
        invoiceParentId: invoice.parentId,
      });
      return res.status(403).json({
        error: 'You do not have permission to check this invoice',
      });
    }

    // If already paid, return cached status
    if (invoice.status === 'paid') {
      console.log('Invoice already marked as paid:', paymentHash);
      return res.json({
        paid: true,
        status: 'paid',
        amount: invoice.amount,
        memo: invoice.memo,
        paidAt: invoice.paidAt?.toDate(),
        createdAt: invoice.createdAt.toDate(),
        processedVia: invoice.processedVia || 'manual',
      });
    }

    // Check with Lightning provider for current status
    console.log('Checking payment status with Lightning provider...');
    let lightningStatus;

    try {
      // Use the correct ID for the Lightning provider
      const lightningId = invoice.lightningId || paymentHash; // Fallback to paymentHash for old invoices
      const provider = invoice.lightningProvider || 'opennode';

      console.log('Using Lightning ID for status check:', {
        lightningId,
        provider,
        paymentHash,
      });

      lightningStatus = await lightningService.getInvoiceStatus(lightningId);
      console.log('Lightning status response:', lightningStatus);
    } catch (lightningError) {
      console.error('Lightning status check failed:', lightningError.message);

      // Return current database status if Lightning check fails
      return res.json({
        paid: false,
        status: invoice.status || 'pending',
        amount: invoice.amount,
        memo: invoice.memo,
        createdAt: invoice.createdAt.toDate(),
        error: 'Unable to verify with payment processor',
        details: lightningError.message,
      });
    }

    // If payment is confirmed, process it
    if (lightningStatus.paid && invoice.status !== 'paid') {
      console.log('Payment confirmed! Processing...');

      try {
        // Use Firestore transaction for atomic updates
        await firestore.runTransaction(async (transaction) => {
          // Update invoice status
          transaction.update(invoiceDoc.ref, {
            status: 'paid',
            paidAt: new Date(),
            processedVia: 'api_check',
          });

          // Update user balance - FIXED: Always update children collection for child accounts
          if (invoice.parentId) {
            // Parent-created invoice for child account
            const childRef = firestore
              .collection('children')
              .doc(invoice.userId);
            transaction.update(childRef, {
              balance: FieldValue.increment(invoice.amount),
            });
          } else {
            // Child-created invoice - also update children collection
            const childRef = firestore
              .collection('children')
              .doc(invoice.userId);
            transaction.update(childRef, {
              balance: FieldValue.increment(invoice.amount),
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
            paymentHash,
            timestamp: new Date(),
            processedVia: 'api_check',
          });
        });

        console.log(
          'Payment processed successfully via API check:',
          paymentHash
        );

        // Return success response
        return res.json({
          paid: true,
          status: 'paid',
          amount: invoice.amount,
          memo: invoice.memo,
          paidAt: new Date(),
          createdAt: invoice.createdAt.toDate(),
          processedVia: 'api_check',
          message: 'Payment confirmed and processed!',
        });
      } catch (processingError) {
        console.error('Error processing confirmed payment:', processingError);
        logger.error('Payment processing error:', processingError);

        return res.status(500).json({
          error: 'Payment confirmed but processing failed',
          details: processingError.message,
          paid: true,
          paymentHash,
        });
      }
    }

    // Payment not yet confirmed
    return res.json({
      paid: false,
      status: invoice.status || 'pending',
      amount: invoice.amount,
      memo: invoice.memo,
      createdAt: invoice.createdAt.toDate(),
      message: 'Payment not yet confirmed',
    });
  } catch (error) {
    console.error('Payment status check error:', error);
    logger.error('Payment status check error:', error);
    res.status(500).json({
      error: 'Failed to check payment status',
      details: error.message,
    });
  }
};

/**
 * Get all pending invoices for a user (for automatic checking)
 */
const getPendingInvoices = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Getting pending invoices for user:', { userId, userRole });

    // Query for pending invoices
    let query = firestore
      .collection('invoices')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'desc')
      .limit(10);

    // Add user filter based on role
    if (userRole === 'child') {
      query = query.where('userId', '==', userId);
    } else if (userRole === 'parent') {
      // Parents can see their own invoices and their children's invoices
      query = query.where('parentId', '==', userId);
    }

    const snapshot = await query.get();
    const pendingInvoices = [];

    snapshot.forEach((doc) => {
      const invoice = doc.data();
      pendingInvoices.push({
        id: doc.id,
        paymentHash: invoice.paymentHash,
        amount: invoice.amount,
        memo: invoice.memo,
        createdAt: invoice.createdAt.toDate(),
        userId: invoice.userId,
        parentId: invoice.parentId,
      });
    });

    console.log(
      `Found ${pendingInvoices.length} pending invoices for user ${userId}`
    );

    res.json({
      pendingInvoices,
      count: pendingInvoices.length,
    });
  } catch (error) {
    console.error('Get pending invoices error:', error);
    logger.error('Get pending invoices error:', error);
    res.status(500).json({
      error: 'Failed to get pending invoices',
      details: error.message,
    });
  }
};

module.exports = {
  checkPaymentStatus,
  getPendingInvoices,
};
