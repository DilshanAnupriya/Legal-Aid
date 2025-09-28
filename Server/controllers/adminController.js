
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token with admin privileges
const generateAdminToken = (userId, role, permissions) => {
  return jwt.sign(
    { userId, role, permissions, isAdmin: true }, 
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '24h' } // Shorter expiry for admin tokens
  );
};

// @desc    Admin login with hardcoded credentials
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res) => {
  try {
    console.log('Admin login attempt:', {
      body: req.body,
      headers: req.headers,
      method: req.method,
      url: req.url
    });

    const { username, password } = req.body;

    // Validation
    if (!username || !password) {
      console.log('Missing credentials:', { username: !!username, password: !!password });
    res.status(400).send({
      success: false,
      message: 'Please provide username and password'
    });
    }

    // Check hardcoded credentials
    if (username !== 'admin' || password !== 'admin') {
      return res.status(401).send({
        success: false,
        message: 'Invalid admin credentials'
      });
    }

    // Find or create admin user in database
    let admin = await User.findOne({ 
      role: 'admin',
      status: 'active'
    });

    // If no admin exists in database, create one
    if (!admin) {
      admin = new User({
        email: 'admin@legalaid.com',
        password: 'admin', // This will be hashed by the model
        role: 'admin',
        adminName: 'System Administrator',
        status: 'active',
        permissions: ['manage_users', 'manage_content', 'view_analytics']
      });
      await admin.save();
      console.log('Admin user created in database');
    }

    // Generate enhanced admin token
    const token = generateAdminToken(admin._id, admin.role, admin.permissions);

    // Log admin login (in production, use proper logging)
    console.log(`Admin login: ${username} at ${new Date().toISOString()}`);

    res.status(200).send({
      success: true,
      message: 'Admin login successful',
      token,
      admin: admin,
      loginTime: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).send({
      success: false,
      message: 'Server error during admin login'
    });
  }
};

// @desc    Get admin profile
// @route   GET /api/admin/profile
// @access  Admin
const getAdminProfile = async (req, res) => {
  try {
    const admin = await User.findById(req.userDetails._id).select('-password');
    
    if (!admin || admin.role !== 'admin') {
      return res.status(404).send({
        success: false,
        message: 'Admin profile not found'
      });
    }

    res.send({
      success: true,
      admin: admin
    });

  } catch (error) {
    console.error('Get admin profile error:', error);
    res.status(500).send({
      success: false,
      message: 'Server error getting admin profile'
    });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/admin/users
// @access  Admin
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    // Build query
    const query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { organizationName: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await User.countDocuments(query);

    res.send({
      success: true,
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).send({
      success: false,
      message: 'Server error getting users'
    });
  }
};

// @desc    Update user status (admin only)
// @route   PUT /api/admin/users/:id/status
// @access  Admin
const updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active or inactive'
      });
    }

    const user = await User.findByIdAndUpdate(
      id,
      { status },
      { new: true, select: '-password' }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Log admin action
    console.log(`Admin ${req.userDetails.email} changed user ${user.email} status to ${status}`);

    res.json({
      success: true,
      message: `User status updated to ${status}`,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error updating user status'
    });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/admin/users/:id
// @access  Admin
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting other admins (safety measure)
    if (user.role === 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Cannot delete admin users'
      });
    }

    await User.findByIdAndDelete(id);

    // Log admin action
    console.log(`Admin ${req.userDetails.email} deleted user ${user.email}`);

    res.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error deleting user'
    });
  }
};

// @desc    Get dashboard statistics
// @route   GET /api/admin/stats
// @access  Admin
const getDashboardStats = async (req, res) => {
  try {
    const [
      totalUsers,
      totalLawyers,
      totalNgos,
      activeUsers,
      recentUsers
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'lawyer' }),
      User.countDocuments({ role: 'ngo' }),
      User.countDocuments({ status: 'active' }),
      User.find()
        .select('-password')
        .sort({ createdAt: -1 })
        .limit(5)
    ]);

    const stats = {
      users: {
        total: totalUsers,
        lawyers: totalLawyers,
        ngos: totalNgos,
        active: activeUsers
      },
      recentUsers: recentUsers.map(user => user.toJSON())
    };

    res.send({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).send({
      success: false,
      message: 'Server error getting statistics'
    });
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getDashboardStats
};
=======
import Admin from "../models/Admin.js";
import jwt from "jsonwebtoken";
import Lawyer from "../models/Lawyer.js";

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// @desc    Register a new admin
// @route   POST /api/admins/register
export const registerAdmin = async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    // Check if admin already exists
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ message: "Email already exists" });

    // Create new admin
    const admin = await Admin.create({ fullName, email, password });

    res.status(201).json({
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      token: generateToken(admin._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login admin
// @route   POST /api/admins/login
export const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        token: generateToken(admin._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get admin profile
// @route   GET /api/admins/profile
export const getAdminProfile = async (req, res) => {
  try {
    const admin = await Admin.findById(req.user.id).select("-password");
    if (!admin) return res.status(404).json({ message: "Admin not found" });

    res.json(admin);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all  lawyers
export const getAllLawyers = async (req, res) => {
  try {
    const lawyers = await Lawyer.find({}).select("-password");
    if (!lawyers || lawyers.length === 0) {
      return res.status(404).json({ message: "No approved lawyers found" });
    }

    res.json(lawyers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


//approve lawyer
export const approveLawyer = async (req, res) => {
  try {
    const lawyerId = req.params.id;
    const { isApproved } = req.body; // boolean

    const lawyer = await Lawyer.findById(lawyerId);
    if (!lawyer) return res.status(404).json({ message: "Lawyer not found" });

    lawyer.isApproved = isApproved; // update approval status
    await lawyer.save();

    res.json({
      message: `Lawyer has been ${isApproved ? "approved" : "disapproved"}`,
      lawyer,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

