const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipient: {
    type: String,
    required: true,
    index: true
  },
  sender: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['comment', 'reply', 'mention', 'like'],
    default: 'comment'
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  postTitle: {
    type: String,
    required: true
  },
  commentContent: {
    type: String,
    required: true,
    maxlength: 200 // Store truncated version for notification
  },
  isRead: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Index for efficient querying of user notifications
notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);

