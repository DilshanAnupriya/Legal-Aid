const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT Token with role information
const generateToken = (userId, role) => {
  return jwt.sign(
    { userId, role }, 
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: '7d' }
  );
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const { email, password, role, ...roleData } = req.body;

    // Basic validation
    if (!email || !password || !role) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email, password, and role'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Validate role
    if (!['user', 'lawyer', 'ngo'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user, lawyer, or ngo'
      });
    }

    // Role-specific validation
    const validationError = validateRoleSpecificData(role, roleData);
    if (validationError) {
      return res.status(400).json({
        success: false,
        message: validationError
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user data based on role
    const userData = {
      email: email.toLowerCase(),
      password,
      role,
      ...roleData
    };

    // Create new user
    const user = new User(userData);
    await user.save();

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.status(201).json({
      success: true,
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

// Helper function to validate role-specific data
const validateRoleSpecificData = (role, data) => {
  switch (role) {
    case 'user':
      if (!data.birthday || !data.genderSpectrum) {
        return 'User registration requires birthday and genderSpectrum';
      }
      if (!['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'].includes(data.genderSpectrum)) {
        return 'Invalid gender spectrum value';
      }
      break;
      
    case 'lawyer':
      const requiredLawyerFields = ['firstName', 'lastName', 'specialization', 'contactNumber'];
      for (const field of requiredLawyerFields) {
        if (!data[field]) {
          return `Lawyer registration requires ${field}`;
        }
      }
      break;
      
    case 'ngo':
      const requiredNgoFields = ['organizationName', 'description', 'category', 'contact'];
      for (const field of requiredNgoFields) {
        if (!data[field]) {
          return `NGO registration requires ${field}`;
        }
      }
      const validCategories = [
        'Human Rights & Civil Liberties',
        'Women\'s Rights & Gender Justice',
        'Child Protection',
        'Labor & Employment Rights',
        'Refugee & Migrant Rights',
        'LGBTQ+ Rights'
      ];
      if (!validCategories.includes(data.category)) {
        return 'Invalid NGO category';
      }
      break;
      
    default:
      return 'Invalid role';
  }
  return null;
};

// @desc    Login user (supports both regular users and admin)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password, username } = req.body;

    // Check for admin login first (with username/password)
    if (username && password) {
      // Admin login with hardcoded credentials
      if (username === 'admin' && password === 'admin') {
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
        const token = jwt.sign(
          { userId: admin._id, role: admin.role, permissions: admin.permissions, isAdmin: true }, 
          process.env.JWT_SECRET || 'fallback_secret',
          { expiresIn: '24h' } // Shorter expiry for admin tokens
        );

        // Log admin login
        console.log(`Admin login: ${username} at ${new Date().toISOString()}`);

        return res.json({
          success: true,
          message: 'Admin login successful',
          token,
          user: admin.toJSON(),
          loginTime: new Date().toISOString()
        });
      } else {
        // Invalid admin credentials
        return res.status(401).json({
          success: false,
          message: 'Invalid admin credentials'
        });
      }
    }

    // Regular user login validation (with email/password)
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token with role
    const token = generateToken(user._id, user.role);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: user.toJSON()
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = req.userDetails;
    
    res.json({
      success: true,
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error getting profile'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.userDetails._id;
    const userRole = req.userDetails.role;
    const updateData = req.body;

    // Remove fields that shouldn't be updated
    delete updateData.email;
    delete updateData.password;
    delete updateData.role;
    delete updateData._id;

    // Validate role-specific updates
    const allowedFields = getAllowedUpdateFields(userRole);
    const filteredUpdateData = {};
    
    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        filteredUpdateData[key] = value;
      }
    }

    if (Object.keys(filteredUpdateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update'
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      filteredUpdateData,
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update profile error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error updating profile'
    });
  }
};

// Helper function to get allowed update fields based on role
const getAllowedUpdateFields = (role) => {
  const commonFields = ['status'];
  
  switch (role) {
    case 'user':
      return [...commonFields, 'birthday', 'genderSpectrum'];
    case 'lawyer':
      return [...commonFields, 'firstName', 'lastName', 'specialization', 'contactNumber'];
    case 'ngo':
      return [...commonFields, 'organizationName', 'description', 'category', 'logo', 'contact', 'images'];
    default:
      return commonFields;
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
};
