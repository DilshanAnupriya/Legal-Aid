const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Get all notifications for a user
router.get('/user/:userEmail', notificationController.getUserNotifications);

// Get unread notification count
router.get('/user/:userEmail/unread-count', notificationController.getUnreadCount);

// Mark notification as read
router.patch('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read for a user
router.patch('/user/:userEmail/mark-all-read', notificationController.markAllAsRead);

// Delete all notifications for a user
router.delete('/user/:userEmail/clear-all', notificationController.deleteAllNotifications);

// Delete a notification
router.delete('/:notificationId', notificationController.deleteNotification);

module.exports = router;

