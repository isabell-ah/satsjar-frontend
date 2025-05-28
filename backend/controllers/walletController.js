const { firestore } = require('../utils/database');
const lightningService = require('../services/lightningService');
const logger = require('../utils/logger');

// Get wallet balance
const getBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Getting balance:', { userId, userRole });

    let balance = 0;
    if (userRole === 'child') {
      const childDoc = await firestore.collection('children').doc(userId).get();
      if (!childDoc.exists) {
        console.error('Child not found:', userId);
        return res.status(404).json({ error: 'Child not found' });
      }
      const childData = childDoc.data();
      balance = childData.balance || 0;
    } else if (userRole === 'parent') {
      const parentDoc = await firestore.collection('users').doc(userId).get();
      if (!parentDoc.exists) {
        console.error('Parent not found:', userId);
        return res.status(404).json({ error: 'Parent not found' });
      }
      const parentData = parentDoc.data();
      balance = parentData.wallet?.balance || 0;
    } else {
      console.error('Invalid role:', userRole);
      return res.status(403).json({ error: 'Invalid user role' });
    }

    res.json({ balance });
  } catch (error) {
    console.error('Get balance error:', error.stack);
    logger.error('Get balance error:', error);
    res
      .status(500)
      .json({ error: 'Failed to get balance', details: error.message });
  }
};

// Create lightning invoice (child only)
const createInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { amount, memo } = req.body;

    console.log('Creating invoice:', { userId, userRole, amount, memo });

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res
        .status(400)
        .json({ error: 'Amount must be a positive number' });
    }

    if (userRole !== 'child') {
      console.error('Invalid role for /wallet/invoice:', userRole);
      return res.status(403).json({
        error:
          'Only child users can create invoices. Parents use /api/wallet/child/:childId/invoice.',
      });
    }

    const childDoc = await firestore.collection('children').doc(userId).get();
    if (!childDoc.exists) {
      console.error('Child not found:', userId);
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();
    if (!childData.wallet?.invoiceKey) {
      console.error('No invoiceKey found for child:', userId);
      return res.status(400).json({ error: 'Child wallet not configured' });
    }

    const invoice = await lightningService.createInvoice(
      childData.wallet.invoiceKey,
      amount,
      memo || `Deposit to ${childData.name}'s wallet`
    );

    const invoiceRef = await firestore.collection('invoices').add({
      userId,
      amount,
      memo: memo || `Deposit to ${childData.name}'s wallet`,
      paymentHash: invoice.payment_hash,
      paymentRequest: invoice.payment_request,
      lightningId: invoice.id, // Store the Lightning provider's ID (chargeId for OpenNode)
      lightningProvider: process.env.LIGHTNING_PROVIDER || 'opennode',
      status: 'pending',
      createdAt: new Date(),
    });

    console.log('Invoice created:', {
      paymentHash: invoice.payment_hash,
      invoiceId: invoiceRef.id,
    });

    res.json({
      paymentHash: invoice.payment_hash,
      paymentRequest: invoice.payment_request,
      amount,
    });
  } catch (error) {
    console.error('Create invoice error:', error.stack);
    logger.error('Create invoice error:', error);
    res
      .status(500)
      .json({ error: 'Failed to create invoice', details: error.message });
  }
};

// Create invoice for child (parent only)
const createChildInvoice = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { childId } = req.params;
    const { amount, memo } = req.body;

    console.log('Creating child invoice:', {
      userId,
      childId,
      userRole,
      amount,
      memo,
    });

    if (userRole !== 'parent') {
      console.error(
        'Non-parent attempted to use /wallet/child/:childId/invoice'
      );
      return res
        .status(403)
        .json({ error: 'Only parents can create child invoices' });
    }

    if (!amount || amount <= 0) {
      console.error('Invalid amount:', amount);
      return res
        .status(400)
        .json({ error: 'Amount must be a positive number' });
    }

    const parentDoc = await firestore.collection('users').doc(userId).get();
    if (!parentDoc.exists) {
      console.error('Parent not found:', userId);
      return res.status(404).json({ error: 'Parent not found' });
    }

    const parentData = parentDoc.data();
    if (!parentData.wallet?.invoiceKey) {
      console.error('No invoiceKey found for parent:', userId);
      return res.status(400).json({ error: 'Parent wallet not configured' });
    }

    const childDoc = await firestore.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      console.error('Child not found:', childId);
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();
    if (childData.parentId !== userId) {
      console.error('Child not associated with parent:', {
        childId,
        parentId: userId,
      });
      return res.status(403).json({
        error: 'You do not have permission to create invoices for this child',
      });
    }

    const invoice = await lightningService.createInvoice(
      parentData.wallet.invoiceKey,
      amount,
      memo || `Deposit to ${childData.name}'s jar`
    );

    const invoiceRef = await firestore.collection('invoices').add({
      userId: childId,
      parentId: userId,
      amount,
      memo: memo || `Deposit to ${childData.name}'s jar`,
      paymentHash: invoice.payment_hash,
      paymentRequest: invoice.payment_request,
      lightningId: invoice.id, // Store the Lightning provider's ID (chargeId for OpenNode)
      lightningProvider: process.env.LIGHTNING_PROVIDER || 'opennode',
      status: 'pending',
      createdAt: new Date(),
    });

    console.log('Child invoice created:', {
      paymentHash: invoice.payment_hash,
      invoiceId: invoiceRef.id,
    });

    res.json({
      paymentHash: invoice.payment_hash,
      paymentRequest: invoice.payment_request,
      amount,
    });
  } catch (error) {
    console.error('Create child invoice error:', error.stack);
    logger.error('Create child invoice error:', error);
    res.status(500).json({
      error: 'Failed to create invoice for child',
      details: error.message,
    });
  }
};

// Check invoice status
const checkInvoiceStatus = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { paymentHash } = req.params;

    console.log('Checking invoice status:', { userId, userRole, paymentHash });

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

    if (invoice.userId !== userId && invoice.parentId !== userId) {
      console.error('Permission denied for invoice:', {
        userId,
        invoiceUserId: invoice.userId,
        invoiceParentId: invoice.parentId,
      });
      return res
        .status(403)
        .json({ error: 'You do not have permission to check this invoice' });
    }

    // Determine which invoice key to use based on who created the invoice
    let invoiceKey = null;
    try {
      if (invoice.parentId) {
        // Parent-created invoice - get parent's invoice key
        console.log(
          'Fetching parent invoice key for parentId:',
          invoice.parentId
        );
        const parentDoc = await firestore
          .collection('users')
          .doc(invoice.parentId)
          .get();
        if (parentDoc.exists) {
          const parentData = parentDoc.data();
          invoiceKey = parentData.wallet?.invoiceKey;
          console.log('Parent invoice key found:', invoiceKey ? 'yes' : 'no');
        } else {
          console.error('Parent document not found:', invoice.parentId);
        }
      } else {
        // Child-created invoice - get child's invoice key
        console.log('Fetching child invoice key for userId:', invoice.userId);
        const childDoc = await firestore
          .collection('children')
          .doc(invoice.userId)
          .get();
        if (childDoc.exists) {
          const childData = childDoc.data();
          invoiceKey = childData.wallet?.invoiceKey;
          console.log('Child invoice key found:', invoiceKey ? 'yes' : 'no');
          console.log('Child wallet data:', childData.wallet);
        } else {
          console.error('Child document not found:', invoice.userId);
        }
      }
    } catch (keyFetchError) {
      console.error('Error fetching invoice key:', keyFetchError);
      // Continue with null invoiceKey to use default
    }

    console.log(
      'Using invoice key for status check:',
      invoiceKey ? 'configured' : 'missing (will use default)'
    );

    const status = await lnbitsService.checkInvoiceStatus(
      paymentHash,
      invoiceKey
    );

    if (status.paid && invoice.status !== 'paid') {
      await firestore.collection('invoices').doc(invoiceDoc.id).update({
        status: 'paid',
        paidAt: new Date(),
      });

      if (invoice.parentId) {
        await firestore
          .collection('children')
          .doc(invoice.userId)
          .update({
            balance: firestore.FieldValue.increment(invoice.amount),
          });
      } else {
        await firestore
          .collection('children')
          .doc(invoice.userId)
          .update({
            balance: firestore.FieldValue.increment(invoice.amount),
          });
      }

      await firestore.collection('transactions').add({
        userId: invoice.userId,
        parentId: invoice.parentId,
        type: 'deposit',
        source: 'lightning',
        amount: invoice.amount,
        description: invoice.memo,
        paymentHash,
        timestamp: new Date(),
      });
    }

    res.json({
      paid: status.paid,
      amount: invoice.amount,
      memo: invoice.memo,
      createdAt: invoice.createdAt.toDate(),
    });
  } catch (error) {
    console.error('Check invoice status error:', error.stack);
    logger.error('Check invoice status error:', error);

    // Provide more specific error message
    let errorMessage = 'Failed to check invoice status';
    if (error.message.includes('Invoice not found')) {
      errorMessage = 'Invoice not found in LNBits';
    } else if (error.message.includes('Invalid LNBits API key')) {
      errorMessage = 'Invalid or missing LNBits API key';
    } else if (error.message.includes('Cannot connect')) {
      errorMessage = 'Cannot connect to LNBits server';
    } else if (
      error.message.includes('Payment confirmed but processing failed')
    ) {
      errorMessage = 'Payment confirmed but processing failed';
    }

    res.status(500).json({
      error: errorMessage,
      details: error.message,
      paymentHash: req.params.paymentHash,
    });
  }
};

// Get wallet transactions
const getTransactions = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;

    console.log('Getting transactions:', { userId, userRole });

    if (userRole !== 'child' && userRole !== 'parent') {
      console.error('Invalid role:', userRole);
      return res.status(403).json({ error: 'Invalid user role' });
    }

    const transactionsSnapshot = await firestore
      .collection('transactions')
      .where('userId', '==', userId)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const transactions = [];
    transactionsSnapshot.forEach((doc) => {
      const transaction = doc.data();
      transactions.push({
        id: doc.id,
        ...transaction,
        timestamp: transaction.timestamp.toDate(),
        date: transaction.timestamp.toDate().toISOString(), // Add date field for frontend compatibility
        status: transaction.status || 'completed',
      });
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error.stack);
    logger.error('Get transactions error:', error);
    res
      .status(500)
      .json({ error: 'Failed to get transactions', details: error.message });
  }
};

// Get child's balance (parent only)
const getChildBalance = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { childId } = req.params;

    console.log('Getting child balance:', { userId, userRole, childId });

    if (userRole !== 'parent') {
      console.error('Non-parent attempted to access child balance');
      return res
        .status(403)
        .json({ error: 'Only parents can access child balances' });
    }

    const childDoc = await firestore.collection('children').doc(childId).get();
    if (!childDoc.exists) {
      console.error('Child not found:', childId);
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();
    if (childData.parentId !== userId) {
      console.error('Child not associated with parent:', {
        childId,
        parentId: userId,
      });
      return res
        .status(403)
        .json({ error: 'You do not have permission to access this child' });
    }

    res.json({ balance: childData.balance || 0 });
  } catch (error) {
    console.error('Get child balance error:', error.stack);
    logger.error('Get child balance error:', error);
    res
      .status(500)
      .json({ error: 'Failed to get child balance', details: error.message });
  }
};

// Get child's transactions (parent only)
const getChildTransactions = async (req, res) => {
  try {
    const { childId } = req.params;
    const parentId = req.user.id;
    const { limit = 20, offset = 0 } = req.query;

    console.log(
      `Parent ${parentId} requesting transactions for child ${childId}`
    );

    // Verify child belongs to parent
    const childDoc = await firestore.collection('children').doc(childId).get();

    if (!childDoc.exists) {
      return res.status(404).json({ error: 'Child not found' });
    }

    const childData = childDoc.data();

    if (childData.parentId !== parentId) {
      return res.status(403).json({
        error: 'You do not have permission to view transactions for this child',
      });
    }

    // Get transactions
    const transactionsQuery = await firestore
      .collection('transactions')
      .where('userId', '==', childId)
      .orderBy('timestamp', 'desc')
      .limit(parseInt(limit))
      .offset(parseInt(offset))
      .get();

    const transactions = [];

    transactionsQuery.forEach((doc) => {
      const transaction = doc.data();
      transactions.push({
        id: doc.id,
        ...transaction,
        timestamp: transaction.timestamp.toDate(),
        date: transaction.timestamp.toDate().toISOString(), // Add date field for frontend compatibility
        status: transaction.status || 'completed',
      });
    });

    console.log(
      `Retrieved ${transactions.length} transactions for child ${childId}`
    );

    res.json(transactions);
  } catch (error) {
    console.error('Get child transactions error:', error);
    res.status(500).json({ error: 'Failed to get transactions' });
  }
};

// Withdraw funds
const withdraw = async (req, res) => {
  try {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { amount, destination } = req.body;

    console.log('Processing withdrawal:', {
      userId,
      userRole,
      amount,
      destination,
    });

    if (!amount || amount <= 0 || !destination) {
      console.error('Invalid withdrawal parameters:', { amount, destination });
      return res.status(400).json({
        error:
          'Amount and destination are required, and amount must be positive',
      });
    }

    let balance = 0;
    let collection;
    if (userRole === 'child') {
      collection = 'children';
      const childDoc = await firestore.collection('children').doc(userId).get();
      if (!childDoc.exists) {
        console.error('Child not found:', userId);
        return res.status(404).json({ error: 'Child not found' });
      }
      const childData = childDoc.data();
      balance = childData.balance || 0;
    } else if (userRole === 'parent') {
      collection = 'users';
      const parentDoc = await firestore.collection('users').doc(userId).get();
      if (!parentDoc.exists) {
        console.error('Parent not found:', userId);
        return res.status(404).json({ error: 'Parent not found' });
      }
      const parentData = parentDoc.data();
      balance = parentData.wallet?.balance || 0;
    } else {
      console.error('Invalid role:', userRole);
      return res.status(403).json({ error: 'Invalid user role' });
    }

    if (balance < amount) {
      console.error('Insufficient balance:', { userId, balance, amount });
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    await firestore.collection('transactions').add({
      userId,
      type: 'withdrawal',
      amount: -amount,
      destination,
      status: 'pending',
      timestamp: new Date(),
    });

    if (userRole === 'child') {
      await firestore
        .collection('children')
        .doc(userId)
        .update({
          balance: firestore.FieldValue.increment(-amount),
        });
    } else {
      await firestore
        .collection('users')
        .doc(userId)
        .update({
          'wallet.balance': firestore.FieldValue.increment(-amount),
        });
    }

    res.json({ success: true, message: 'Withdrawal initiated' });
  } catch (error) {
    console.error('Withdraw error:', error.stack);
    logger.error('Withdraw error:', error);
    res
      .status(500)
      .json({ error: 'Failed to process withdrawal', details: error.message });
  }
};

// Get all transactions for parent (across all children)
const getParentTransactions = async (req, res) => {
  try {
    const parentId = req.user.id;
    const userRole = req.user.role;
    const { limit = 50, offset = 0 } = req.query;

    console.log('Getting parent transactions:', { parentId, userRole });

    if (userRole !== 'parent' && userRole !== 'admin') {
      console.error('Non-parent/admin attempted to access parent transactions');
      return res.status(403).json({
        error: 'Only parents and admins can access parent transactions',
      });
    }

    // Get all children for this parent (or all children if admin)
    let childrenSnapshot;
    if (userRole === 'admin') {
      // Admin can see all children
      childrenSnapshot = await firestore.collection('children').get();
    } else {
      // Parent can only see their own children
      childrenSnapshot = await firestore
        .collection('children')
        .where('parentId', '==', parentId)
        .get();
    }

    const childrenIds = [];
    const childrenMap = {};

    childrenSnapshot.forEach((doc) => {
      const childData = doc.data();
      childrenIds.push(doc.id);
      childrenMap[doc.id] = childData.name;
    });

    console.log(`Found ${childrenIds.length} children for parent ${parentId}`);

    if (childrenIds.length === 0) {
      return res.json([]);
    }

    // Get transactions for all children
    const allTransactions = [];

    // Fetch transactions for each child
    for (const childId of childrenIds) {
      try {
        const childTransactionsSnapshot = await firestore
          .collection('transactions')
          .where('userId', '==', childId)
          .orderBy('timestamp', 'desc')
          .limit(20) // Limit per child to avoid too much data
          .get();

        childTransactionsSnapshot.forEach((doc) => {
          const transaction = doc.data();
          allTransactions.push({
            id: doc.id,
            ...transaction,
            timestamp: transaction.timestamp.toDate(),
            date: transaction.timestamp.toDate().toISOString(), // Add date field for frontend compatibility
            childName: childrenMap[transaction.userId] || 'Unknown Child',
            childId: transaction.userId,
            status: transaction.status || 'completed',
          });
        });
      } catch (error) {
        console.error(
          `Error fetching transactions for child ${childId}:`,
          error
        );
      }
    }

    // Sort all transactions by timestamp (newest first)
    allTransactions.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Apply limit and offset
    const paginatedTransactions = allTransactions.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );

    console.log(
      `Retrieved ${paginatedTransactions.length} total transactions for parent ${parentId}`
    );

    res.json(paginatedTransactions);
  } catch (error) {
    console.error('Get parent transactions error:', error);
    logger.error('Get parent transactions error:', error);
    res.status(500).json({
      error: 'Failed to get parent transactions',
      details: error.message,
    });
  }
};

module.exports = {
  getBalance,
  createInvoice,
  createChildInvoice,
  checkInvoiceStatus,
  getTransactions,
  getChildBalance,
  getChildTransactions,
  getParentTransactions,
  withdraw,
};
