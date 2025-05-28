/**
 * WebSocket routes for real-time payment notifications
 */

const WebSocket = require('ws');
const jwt = require('jsonwebtoken');
const config = require('../config/config');
const paymentNotificationService = require('../services/paymentNotificationService');

/**
 * Set up WebSocket server for real-time notifications
 */
function setupWebSocketServer(server) {
  const wss = new WebSocket.Server({ 
    server,
    path: '/ws/notifications'
  });

  console.log('WebSocket server initialized on /ws/notifications');

  wss.on('connection', (ws, req) => {
    console.log('New WebSocket connection attempt');

    // Extract token from query parameters or headers
    const url = new URL(req.url, `http://${req.headers.host}`);
    const token = url.searchParams.get('token') || req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      console.log('WebSocket connection rejected: No token provided');
      ws.close(1008, 'Authentication required');
      return;
    }

    try {
      // Verify JWT token
      const decoded = jwt.verify(token, config.jwt.secret);
      const userId = decoded.userId;
      const userRole = decoded.role;

      console.log('WebSocket connection authenticated:', {
        userId,
        userRole,
        ip: req.socket.remoteAddress
      });

      // Register connection for notifications
      paymentNotificationService.registerConnection(userId, ws);

      // Send connection confirmation
      ws.send(JSON.stringify({
        type: 'connection_established',
        data: {
          userId,
          userRole,
          timestamp: new Date().toISOString(),
          message: 'Real-time notifications enabled'
        }
      }));

      // Handle incoming messages
      ws.on('message', (message) => {
        try {
          const data = JSON.parse(message);
          console.log('WebSocket message received:', data);

          // Handle ping/pong for connection health
          if (data.type === 'ping') {
            ws.send(JSON.stringify({
              type: 'pong',
              timestamp: new Date().toISOString()
            }));
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });

      // Handle connection close
      ws.on('close', (code, reason) => {
        console.log('WebSocket connection closed:', {
          userId,
          code,
          reason: reason.toString()
        });
      });

      // Handle errors
      ws.on('error', (error) => {
        console.error('WebSocket error for user:', userId, error);
      });

    } catch (error) {
      console.log('WebSocket authentication failed:', error.message);
      ws.close(1008, 'Invalid token');
    }
  });

  // Periodic cleanup of dead connections
  setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.ping();
      }
    });
  }, 30000); // Every 30 seconds

  return wss;
}

/**
 * Get WebSocket connection status (for debugging)
 */
function getWebSocketStatus(req, res) {
  const status = paymentNotificationService.getConnectionStatus();
  res.json({
    ...status,
    timestamp: new Date().toISOString()
  });
}

module.exports = {
  setupWebSocketServer,
  getWebSocketStatus
};
