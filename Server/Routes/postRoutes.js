const express = require('express');
const router = express.Router();
const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostStats
} = require('../controllers/postController');

const {
  validateCreatePost,
  validateUpdatePost,
  validateObjectId,
  createRateLimit
} = require('../middleware/validation');

const {
  authenticateToken,
  authorizeRoles,
  optionalAuth
} = require('../middleware/authmiddleware');

// @route   POST /api/posts
// @desc    Create a new post
// @access  Public (for now - can add authentication later)
router.post('/', createRateLimit(), validateCreatePost, createPost);

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
// @access  Public
router.get('/', getPosts);

// @route   GET /api/posts/stats
// @desc    Get post statistics
// @access  Public
router.get('/stats', getPostStats);

// @route   GET /api/posts/:id
// @desc    Get a single post by ID
// @access  Public
router.get('/:id', validateObjectId, getPostById);

// @route   PUT /api/posts/:id
// @desc    Update a post
// @access  Public (for now - should be restricted to post owner)
router.put('/:id', validateObjectId, validateUpdatePost, updatePost);

// @route   DELETE /api/posts/:id
// @desc    Delete a post (soft delete)
// @access  Public (for now - should be restricted to post owner/admin)
router.delete('/:id', validateObjectId, deletePost);

module.exports = router;