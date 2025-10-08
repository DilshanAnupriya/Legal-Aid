const mongoose = require('mongoose');

const pollSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  options: [{
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  }],
  votes: [{
    type: Number,
    default: 0
  }],
  voters: [{
    userId: {
      type: String,
      required: true
    },
    selectedOption: {
      type: Number,
      required: true
    },
    votedAt: {
      type: Date,
      default: Date.now
    }
  }],
  totalVotes: {
    type: Number,
    default: 0
  },
  author: {
    type: String,
    required: true,
    default: 'Anonymous User'
  },
  authorEmail: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: true,
    enum: ['All', 'Family Law', 'Property Law', 'Employment Law', 'Civil Law', 'Criminal Law'],
    default: 'Family Law'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'closed', 'deleted'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: null // null means no expiry
  }
});

// Update the updatedAt field before saving
pollSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  this.lastActivity = Date.now();
  
  // Ensure votes array matches options array length
  if (this.votes.length !== this.options.length) {
    this.votes = new Array(this.options.length).fill(0);
  }
  
  next();
});

// Virtual for formatted last activity
pollSchema.virtual('lastActivityFormatted').get(function() {
  const now = new Date();
  const diff = now - this.lastActivity;
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  
  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    return 'Just now';
  }
});

// Virtual for poll results with percentages
pollSchema.virtual('results').get(function() {
  if (this.totalVotes === 0) {
    return this.options.map((option, index) => ({
      option,
      votes: this.votes[index] || 0,
      percentage: 0
    }));
  }
  
  return this.options.map((option, index) => {
    const votes = this.votes[index] || 0;
    const percentage = ((votes / this.totalVotes) * 100).toFixed(1);
    return {
      option,
      votes,
      percentage: parseFloat(percentage)
    };
  });
});

// Method to cast a vote
pollSchema.methods.vote = function(userId, optionIndex) {
  if (optionIndex < 0 || optionIndex >= this.options.length) {
    throw new Error('Invalid option index');
  }
  
  // Check if user has already voted
  const existingVote = this.voters.find(voter => voter.userId === userId);
  if (existingVote) {
    throw new Error('User has already voted');
  }
  
  // Add vote
  this.votes[optionIndex] = (this.votes[optionIndex] || 0) + 1;
  this.totalVotes += 1;
  this.voters.push({
    userId,
    selectedOption: optionIndex,
    votedAt: new Date()
  });
  
  this.lastActivity = Date.now();
  return this.save();
};

// Method to check if user has voted
pollSchema.methods.hasUserVoted = function(userId) {
  return this.voters.some(voter => voter.userId === userId);
};

// Method to get user's vote
pollSchema.methods.getUserVote = function(userId) {
  const vote = this.voters.find(voter => voter.userId === userId);
  return vote ? vote.selectedOption : null;
};

// Index for better query performance
pollSchema.index({ createdAt: -1 });
pollSchema.index({ category: 1 });
pollSchema.index({ status: 1 });
pollSchema.index({ 'voters.userId': 1 });

module.exports = mongoose.model('Poll', pollSchema);
