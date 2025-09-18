const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  author: {
    type: String,
    required: true,
    default: 'Anonymous User'
  },
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Post',
    required: true
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
commentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Index for better query performance
commentSchema.index({ postId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
