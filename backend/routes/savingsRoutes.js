const express = require('express');
const router = express.Router();
const {
  createSavingsPlan,
  getSavingsPlans,
  getChildSavingsSummary,
  toggleSavingsPlan,
  deleteSavingsPlan,
} = require('../controllers/savingsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.use(authenticateToken);

// Create a new savings plan
router.post('/', createSavingsPlan);

// Get all savings plans
router.get('/', getSavingsPlans);

// Child-specific routes
router.get('/summary', getChildSavingsSummary);

// Toggle a savings plan (works for both parent and child)
router.post('/:planId/toggle', toggleSavingsPlan);

// Delete a savings plan (works for both parent and child)
router.delete('/:planId', deleteSavingsPlan);

module.exports = router;
