const express = require('express');
const router = express.Router();
const { 
  registerUser, 
  loginUser, 
  getUserProfile, 
  updateUserProfile ,
  getAllLawyers,
  
} = require('../controllers/userController');
const { authenticateToken, authorizeRoles } = require('../middleware/authmiddleware');

// @route   POST /api/auth/register
// @desc    Register new user (any role)
// @access  Public
router.post('/register', registerUser);

// @route   POST /api/auth/login
// @desc    Login user (any role)
// @access  Public
router.post('/login', loginUser);

// @route   GET /api/auth/profile
// @desc    Get user profile (any role)
// @access  Private
router.get('/profile', authenticateToken, getUserProfile);

// @route   PUT /api/auth/profile
// @desc    Update user profile (any role)
// @access  Private
router.put('/profile', authenticateToken, updateUserProfile);

// Role-specific routes examples (you can add more as needed)
// @route   GET /api/auth/user-dashboard
// @desc    Get user dashboard (regular users only)
// @access  Private
router.get('/user-dashboard', authenticateToken, authorizeRoles('user'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to user dashboard',
    user: req.userDetails.toJSON()
  });
});

// @route   GET /api/auth/lawyer-dashboard
// @desc    Get lawyer dashboard (lawyers only)
// @access  Private
router.get('/lawyer-dashboard', authenticateToken, authorizeRoles('lawyer'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to lawyer dashbxoard',
    user: req.userDetails.toJSON()
  });
});

// @route   GET /api/auth/ngo-dashboard
// @desc    Get NGO dashboard (NGOs only)
// @access  Private
router.get('/ngo-dashboard', authenticateToken, authorizeRoles('ngo'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to NGO dashboard',
    user: req.userDetails.toJSON()
  });
});

// @route   GET /api/auth/admin-panel
// @desc    Admin panel access (lawyers and NGOs)
// @access  Private
router.get('/admin-panel', authenticateToken, authorizeRoles('lawyer', 'ngo'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to admin panel',
    user: req.userDetails.toJSON(),
    permissions: req.userDetails.role === 'lawyer' ? 'Legal consultation access' : 'Community management access'
  });
});

// @route   GET /api/auth/admin-dashboard
// @desc    Admin dashboard (admin only)
// @access  Private
router.get('/admin-dashboard', authenticateToken, authorizeRoles('admin'), (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to admin dashboard',
    user: req.userDetails.toJSON(),
    permissions: req.userDetails.permissions || []
  });
});

// GET /api/lawyers
router.get('/lawyers', getAllLawyers);

module.exports = router;
