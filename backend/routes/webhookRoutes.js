const express = require('express');
const { handleLNBitsWebhook, testWebhook } = require('../controllers/webhookController');

const router = express.Router();

// LNBits webhook endpoint (no authentication required for webhooks)
router.post('/lnbits', handleLNBitsWebhook);

// Test endpoint to verify webhook is working
router.get('/lnbits/test', testWebhook);

module.exports = router;
