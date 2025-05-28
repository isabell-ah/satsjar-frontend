/**
 * Real-time payment notification service
 * Handles automatic payment detection and user notifications
 */

const { firestore } = require('../utils/database');
const logger = require('../utils/logger');

class PaymentNotificationService {
  constructor() {
    this.activeConnections = new Map(); // Store WebSocket connections
  }

  /**
   * Register a WebSocket connection for payment notifications
   */
  registerConnection(userId, ws) {
    console.log('Registering WebSocket connection for user:', userId);
    this.activeConnections.set(userId, ws);

    // Clean up on disconnect
    ws.on('close', () => {
      console.log('WebSocket connection closed for user:', userId);
      this.activeConnections.delete(userId);
    });

    ws.on('error', (error) => {
      console.error('WebSocket error for user:', userId, error);
      this.activeConnections.delete(userId);
    });
  }

  /**
   * Send real-time payment notification to user
   */
  async notifyPaymentReceived(invoice) {
    try {
      const { userId, parentId, amount, paymentHash } = invoice;
      
      console.log('Sending payment notification:', {
        userId,
        parentId,
        amount,
        paymentHash
      });

      // Prepare notification data
      const notification = {
        type: 'payment_received',
        data: {
          paymentHash,
          amount,
          timestamp: new Date().toISOString(),
          message: `Payment of ${amount} sats received!`
        }
      };

      // Send to child user
      if (this.activeConnections.has(userId)) {
        const childWs = this.activeConnections.get(userId);
        if (childWs.readyState === 1) { // WebSocket.OPEN
          childWs.send(JSON.stringify(notification));
          console.log('Notification sent to child:', userId);
        }
      }

      // Send to parent if this is a child payment
      if (parentId && this.activeConnections.has(parentId)) {
        const parentWs = this.activeConnections.get(parentId);
        if (parentWs.readyState === 1) { // WebSocket.OPEN
          const parentNotification = {
            ...notification,
            data: {
              ...notification.data,
              childId: userId,
              message: `Child received payment of ${amount} sats!`
            }
          };
          parentWs.send(JSON.stringify(parentNotification));
          console.log('Notification sent to parent:', parentId);
        }
      }

    } catch (error) {
      console.error('Error sending payment notification:', error);
      logger.error('Payment notification error:', error);
    }
  }

  /**
   * Send balance update notification
   */
  async notifyBalanceUpdate(userId, newBalance) {
    try {
      if (this.activeConnections.has(userId)) {
        const ws = this.activeConnections.get(userId);
        if (ws.readyState === 1) {
          const notification = {
            type: 'balance_updated',
            data: {
              balance: newBalance,
              timestamp: new Date().toISOString()
            }
          };
          ws.send(JSON.stringify(notification));
          console.log('Balance update sent to user:', userId);
        }
      }
    } catch (error) {
      console.error('Error sending balance update:', error);
    }
  }

  /**
   * Send invoice status update
   */
  async notifyInvoiceStatusUpdate(paymentHash, status, userId) {
    try {
      if (this.activeConnections.has(userId)) {
        const ws = this.activeConnections.get(userId);
        if (ws.readyState === 1) {
          const notification = {
            type: 'invoice_status_update',
            data: {
              paymentHash,
              status,
              timestamp: new Date().toISOString()
            }
          };
          ws.send(JSON.stringify(notification));
          console.log('Invoice status update sent to user:', userId);
        }
      }
    } catch (error) {
      console.error('Error sending invoice status update:', error);
    }
  }

  /**
   * Get connection status for debugging
   */
  getConnectionStatus() {
    return {
      activeConnections: this.activeConnections.size,
      connectedUsers: Array.from(this.activeConnections.keys())
    };
  }
}

module.exports = new PaymentNotificationService();
