const express = require('express');
const {
  getWalletInfo,
  withdrawFunds,
  getTransactionHistory,
  createWithdrawalInvoice,
} = require('../controllers/adminController');
const {
  authenticateToken,
  requireAdminRole,
} = require('../middlewares/authMiddleware');

const router = express.Router();

// All admin routes require authentication AND admin role
// This ensures only administrators can access wallet management

// Get LNBits wallet information
router.get('/wallet/info', authenticateToken, requireAdminRole, getWalletInfo);

// Get transaction history
router.get(
  '/wallet/transactions',
  authenticateToken,
  requireAdminRole,
  getTransactionHistory
);

// Create withdrawal invoice (for moving funds to your personal wallet)
router.post(
  '/wallet/withdrawal-invoice',
  authenticateToken,
  requireAdminRole,
  createWithdrawalInvoice
);

// Withdraw funds using Lightning invoice
router.post(
  '/wallet/withdraw',
  authenticateToken,
  requireAdminRole,
  withdrawFunds
);

module.exports = router;
