
const express = require('express');
const {
  adminLogin,
  getAdminProfile,
  getAllUsers,
  getAllLawyers,
  getAllNGOs,
  updateUserStatus,
  deleteUser,
  getDashboardStats,
  updateLawyerStatus
} = require('../controllers/adminController');
const { authenticateToken, requireAdmin } = require('../middleware/authmiddleware');

const router = express.Router();

// @desc    Admin login
// @route   POST /api/admin/login
// @access  Public
router.post('/login', adminLogin);

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Admin only
router.get('/profile', authenticateToken, requireAdmin, getAdminProfile);

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Admin only
router.get('/users', authenticateToken, requireAdmin, getAllUsers);

// @desc    Get all lawyers
// @route   GET /api/admin/lawyers
// @access  Admin only
router.get('/lawyers', authenticateToken, requireAdmin, getAllLawyers);

// @desc    Get all NGOs
// @route   GET /api/admin/ngos
// @access  Admin only
router.get('/ngos', authenticateToken, requireAdmin, getAllNGOs);

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
router.put('/users/:id/status', authenticateToken, requireAdmin, updateUserStatus);


// @desc    Update lawyer status
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
router.put('/lawyers/:id/status', authenticateToken, requireAdmin, updateLawyerStatus);

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin only
router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);

module.exports = router;