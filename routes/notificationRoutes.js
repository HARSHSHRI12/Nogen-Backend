const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  clearAllNotifications,
  createNotification,
} = require('../controllers/notificationController');
const authMiddleware = require('../middleware/authMiddleware');

// Get all notifications
router.get('/', authMiddleware, getNotifications);

// Mark specific notification as read
router.put('/:notificationId/read', authMiddleware, markAsRead);

// Mark all as read
router.put('/mark-all/read', authMiddleware, markAllAsRead);

// Delete specific notification
router.delete('/:notificationId', authMiddleware, deleteNotification);

// Clear all notifications
router.delete('/clear/all', authMiddleware, clearAllNotifications);

// Create notification (admin only - in production add roleMiddleware)
router.post('/', createNotification);

module.exports = router;
