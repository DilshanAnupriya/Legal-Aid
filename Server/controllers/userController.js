const User = require('../models/User');
const NGO = require('../Models/NgoModel'); // Add this import
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

    // If role is NGO, create NGO document as well
    if (role === 'ngo') {
      const ngoData = {
        name: roleData.organizationName,
        description: roleData.description,
        category: roleData.category,
        contact: roleData.contact,
        email: email.toLowerCase(),
        logo: roleData.logo || null,
        images: roleData.images || [],
        status: 'active',
        rating: 0
      };

      const ngo = new NGO(ngoData);
      await ngo.save();

      console.log('NGO document created:', ngo._id);
    }

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

    // If user is an NGO, also update the NGO document
    if (userRole === 'ngo') {
      const ngoUpdateData = {};

      if (filteredUpdateData.organizationName) ngoUpdateData.name = filteredUpdateData.organizationName;
      if (filteredUpdateData.description) ngoUpdateData.description = filteredUpdateData.description;
      if (filteredUpdateData.category) ngoUpdateData.category = filteredUpdateData.category;
      if (filteredUpdateData.contact) ngoUpdateData.contact = filteredUpdateData.contact;
      if (filteredUpdateData.logo !== undefined) ngoUpdateData.logo = filteredUpdateData.logo;
      if (filteredUpdateData.images !== undefined) ngoUpdateData.images = filteredUpdateData.images;

      if (Object.keys(ngoUpdateData).length > 0) {
        await NGO.findOneAndUpdate(
            { email: user.email },
            ngoUpdateData,
            { new: true, runValidators: true }
        );
      }
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

// Add this to ngoController.js instead
// This is just a reference for the new controller method needed


// @desc    Get all lawyers
// @route   GET /api/lawyers
// @access  Public (or protect if needed)
const getAllLawyers = async (req, res) => {
  try {
    const {
      searchText = '',
      page = 1,
      size = 10,
      category = ''
    } = req.query;

    const pageNumber = parseInt(page);
    const pageSize = parseInt(size);

    // Initial filter for approved lawyers only
    const filter = {
      role: 'lawyer',
      lawyerStatus: 'accepted'
    };

    // Add category filter if provided
    if (category) {
      filter.specialization = category;
    }

    // Add search filters
    if (searchText) {
      filter.$or = [
        { firstName: { $regex: searchText, $options: 'i' } },
        { lastName: { $regex: searchText, $options: 'i' } },
        { specialization: { $regex: searchText, $options: 'i' } }
      ];
    }

    // Define tier priority (higher tiers come first)
    const tierPriority = {
      "Champion of Justice": 5,
      "Legal Mentor": 4,
      "Justice Advocate": 3,
      "Legal Helper": 2,
      "Community Ally": 1,
    };

    // Count total matching lawyers
    const total = await User.countDocuments(filter);

     // Fetch all lawyers matching filter
    const lawyers = await User.find(filter)
      .select("-password"); // remove .lean()

      // Sort manually based on tier priority (high → low), then newest first
    const sortedLawyers = lawyers.sort((a, b) => {
      const tierA = tierPriority[a.tier] || 0;
      const tierB = tierPriority[b.tier] || 0;

      // Higher tier first
      if (tierA !== tierB) return tierB - tierA;

      // If same tier, sort by createdAt (newest first)
      return new Date(b.createdAt) - new Date(a.createdAt);
    });
    // Apply pagination after sorting
    const startIndex = (pageNumber - 1) * pageSize;
    const paginatedLawyers = sortedLawyers.slice(
      startIndex,
      startIndex + pageSize
    );

    const totalPages = Math.ceil(total / pageSize);
    

    return res.status(200).json({
      message: 'list',
      data: lawyers.map((lawyer) => lawyer.toJSON()),
      pagination: {
        count: total,
        currentPage: pageNumber,
        totalPages,
        hasNext: pageNumber < totalPages,
        hasPrev: pageNumber > 1
      }
    });
  } catch (error) {
    console.error('Error fetching lawyers:', error);
    return res.status(500).json({
      message: 'error',
      error: error.message
    });
  }
};



module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  getAllLawyers,
  
};