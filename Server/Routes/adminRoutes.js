
const express = require('express');
const {
  adminLogin,
  getAdminProfile,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getDashboardStats
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

// @desc    Update user status
// @route   PUT /api/admin/users/:id/status
// @access  Admin only
router.put('/users/:id/status', authenticateToken, requireAdmin, updateUserStatus);

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Admin only
router.delete('/users/:id', authenticateToken, requireAdmin, deleteUser);

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin only
router.get('/stats', authenticateToken, requireAdmin, getDashboardStats);
=======
const express = require("express");
const { registerAdmin, loginAdmin, getAdminProfile, getAllLawyers , approveLawyer } = require("../controllers/adminController.js");

const router = express.Router();

router.post("/", registerAdmin);
router.post("/login", loginAdmin);
router.get("/profile", getAdminProfile);
router.get("/lawyers",getAllLawyers);

// Approve or disapprove a lawyer
router.put("/lawyers/:id/approve", approveLawyer);



module.exports = router;