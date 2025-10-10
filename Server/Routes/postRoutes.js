const express = require('express');
const router = express.Router();


const {
  createPost,
  getPosts,
  getPostById,
  updatePost,
  deletePost,
  getPostStats,
  getTrendingPosts
} = require('../controllers/postController');

const {
  addComment,
  getComments,
  deleteComment,
  updateComment
} = require('../controllers/commentController');

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
router.post('/',createRateLimit(), validateCreatePost, createPost);

// @route   GET /api/posts
// @desc    Get all posts with filtering and pagination
// @access  Public
router.get('/', getPosts);

// Static routes MUST come before parameterized routes
// @route   GET /api/posts/stats
// @desc    Get post statistics
// @access  Public
router.get('/stats', getPostStats);

// @route   GET /api/posts/trending
// @desc    Get trending posts (most viewed)
// @access  Public
router.get('/trending', getTrendingPosts);

// Comment routes - PUT BEFORE general :id routes to avoid conflicts
// @route   PUT /api/posts/comments/:commentId/update
// @desc    Update a comment
// @access  Public (for now - should be restricted to comment owner)
router.put('/comments/:commentId/update', updateComment);

// @route   DELETE /api/posts/comments/:commentId
// @desc    Delete a comment
// @access  Public (for now - should be restricted to comment owner)
router.delete('/comments/:commentId', validateObjectId, deleteComment);

// @route   POST /api/posts/:postId/comments
// @desc    Add a comment to a post
// @access  Public (for now - can add authentication later)
router.post('/:postId/comments', validateObjectId, createRateLimit(), addComment);

// @route   GET /api/posts/:postId/comments
// @desc    Get comments for a post
// @access  Public
router.get('/:postId/comments', validateObjectId, getComments);

// Post routes - PUT AFTER comment routes
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