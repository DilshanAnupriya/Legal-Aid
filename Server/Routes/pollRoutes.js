const express = require('express');
const router = express.Router();
const {
  createPoll,
  getPolls,
  getPollById,
  voteOnPoll,
  getPollResults,
  updatePoll,
  deletePoll,
  getPollStats
} = require('../controllers/pollController');

const {
  validateObjectId,
  createRateLimit
} = require('../middleware/validation');

const {
  authenticateToken,
  authorizeRoles,
  optionalAuth
} = require('../middleware/authmiddleware');

// Validation middleware for creating polls
const validateCreatePoll = (req, res, next) => {
  const { topic, options } = req.body;
  
  if (!topic || typeof topic !== 'string' || topic.trim().length < 10) {
    return res.status(400).json({
      success: false,
      message: 'Topic is required and must be at least 10 characters long'
    });
  }
  
  if (!options || !Array.isArray(options) || options.length < 2) {
    return res.status(400).json({
      success: false,
      message: 'At least 2 options are required'
    });
  }
  
  if (options.length > 6) {
    return res.status(400).json({
      success: false,
      message: 'Maximum 6 options allowed'
    });
  }
  
  for (let i = 0; i < options.length; i++) {
    if (!options[i] || typeof options[i] !== 'string' || options[i].trim().length < 1) {
      return res.status(400).json({
        success: false,
        message: `Option ${i + 1} is required and must be non-empty`
      });
    }
  }
  
  next();
};

// Validation middleware for voting
const validateVote = (req, res, next) => {
  const { optionIndex, userId } = req.body;
  
  if (optionIndex === undefined || typeof optionIndex !== 'number' || optionIndex < 0) {
    return res.status(400).json({
      success: false,
      message: 'Valid option index is required'
    });
  }
  
  if (!userId || typeof userId !== 'string' || userId.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: 'User ID is required'
    });
  }
  
  next();
};

// @route   POST /api/polls
// @desc    Create a new poll
// @access  Public (for now - can add authentication later)
router.post('/', createRateLimit(), validateCreatePoll, createPoll);

// @route   GET /api/polls
// @desc    Get all polls with filtering and pagination
// @access  Public
router.get('/', getPolls);

// Static routes MUST come before parameterized routes
// @route   GET /api/polls/stats
// @desc    Get poll statistics
// @access  Public
router.get('/stats', getPollStats);

// @route   POST /api/polls/:id/vote
// @desc    Vote on a poll
// @access  Public (for now - can add authentication later)
router.post('/:id/vote', validateObjectId, createRateLimit(), validateVote, voteOnPoll);

// @route   GET /api/polls/:id/results
// @desc    Get poll results
// @access  Public
router.get('/:id/results', validateObjectId, getPollResults);

// @route   GET /api/polls/:id
// @desc    Get a single poll by ID
// @access  Public
router.get('/:id', validateObjectId, getPollById);

// @route   PUT /api/polls/:id
// @desc    Update a poll (close/delete)
// @access  Public (for now - should be restricted to poll owner)
router.put('/:id', validateObjectId, updatePoll);

// @route   DELETE /api/polls/:id
// @desc    Delete a poll (soft delete)
// @access  Public (for now - should be restricted to poll owner/admin)
router.delete('/:id', validateObjectId, deletePoll);

module.exports = router;
