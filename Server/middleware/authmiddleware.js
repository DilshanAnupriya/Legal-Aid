const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware
const authenticateToken = async (req, res, next) => {
  try {
    console.log('authenticateToken middleware - checking token');
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      console.log('No token provided');
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    console.log('Token decoded:', { userId: decoded.userId, role: decoded.role, isAdmin: decoded.isAdmin });
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      console.log('User not found for userId:', decoded.userId);
      return res.status(401).json({
        success: false,
        message: 'Invalid token or user not found'
      });
    }

    console.log('User found:', { id: user._id, role: user.role, email: user.email });

    // Verify role consistency (optional security check)
    if (decoded.role && decoded.role !== user.role) {
      console.log('Role mismatch:', { tokenRole: decoded.role, userRole: user.role });
      return res.status(401).json({
        success: false,
        message: 'Token role mismatch'
      });
    }

    req.user = { ...decoded, role: user.role }; // Ensure role is up to date
    req.userDetails = user;
    console.log('Authentication successful');
    next();

  } catch (error) {
    console.error('Authentication error:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

// Authorization middleware - check user roles
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.userDetails) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    if (req.userDetails.role && !roles.includes(req.userDetails.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required roles: ${roles.join(', ')}. Your role: ${req.userDetails.role}`
      });
    }

    next();
  };
};

// Admin authorization middleware
const requireAdmin = (req, res, next) => {
  console.log('requireAdmin middleware - checking admin access');
  console.log('userDetails:', req.userDetails ? { id: req.userDetails._id, role: req.userDetails.role } : 'null');
  
  if (!req.userDetails) {
    console.log('No userDetails found - authentication required');
    return res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
  }

  if (req.userDetails.role !== 'admin') {
    console.log(`Access denied - role is '${req.userDetails.role}', not 'admin'`);
    return res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required'
    });
  }

  console.log('Admin access granted');
  next();
};

// Optional authentication middleware - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      req.user = null;
      req.userDetails = null;
      return next();
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
    
    // Get user from token
    const user = await User.findById(decoded.userId).select('-password');
    
    if (user) {
      req.user = { ...decoded, role: user.role };
      req.userDetails = user;
    } else {
      req.user = null;
      req.userDetails = null;
    }

    next();

  } catch (error) {
    // For optional auth, we don't fail on token errors
    req.user = null;
    req.userDetails = null;
    next();
  }
};

module.exports = {
  authenticateToken,
  protect: authenticateToken, // Alias for compatibility
  authorizeRoles,
  requireAdmin,
  optionalAuth
};
