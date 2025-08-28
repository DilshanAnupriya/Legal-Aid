const express = require('express');
const router = express.Router();
const {
  addComment,
  getComments,
  deleteComment
} = require('../controllers/commentController');

const {
  validateObjectId,
  createRateLimit
} = require('../middleware/validation');

// @route   POST /api/posts/:postId/comments
// @desc    Add a comment to a post
// @access  Public (for now - can add authentication later)
router.post('/:postId/comments', validateObjectId, createRateLimit(), addComment);

// @route   GET /api/posts/:postId/comments
// @desc    Get comments for a post
// @access  Public
router.get('/:postId/comments', validateObjectId, getComments);

// @route   DELETE /api/comments/:commentId
// @desc    Delete a comment
// @access  Public (for now - should be restricted to comment owner)
router.delete('/comments/:commentId', deleteComment);

module.exports = router;
