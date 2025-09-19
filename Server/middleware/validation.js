const PostService = require('../Services/postServices');
const ocrService = require('../Services/ocrServices');

// Validate post creation data
const validateCreatePost = (req, res, next) => {
  const { title, description, tags } = req.body;

  // Basic validation
  const validation = PostService.validatePostData({ title, description, tags });
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }

  // Sanitize data
  req.body.title = title.trim();
  req.body.description = description.trim();
  
  if (tags && Array.isArray(tags)) {
    req.body.tags = tags.map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  next();
};

// Validate post update data
const validateUpdatePost = (req, res, next) => {
  const allowedFields = ['title', 'description', 'tags', 'category', 'priority', 'isAnswered'];
  const updates = {};

  // Filter only allowed fields
  Object.keys(req.body).forEach(key => {
    if (allowedFields.includes(key)) {
      updates[key] = req.body[key];
    }
  });

  req.body = updates;

  // Validate if there are updates to validate
  if (updates.title || updates.description || updates.tags) {
    const validation = PostService.validatePostData(updates);
    
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validation.errors
      });
    }
  }

  next();
};

// Validate MongoDB ObjectId
const validateObjectId = (req, res, next) => {
  // Check for different possible parameter names
  const { id, postId, commentId } = req.params;
  const objectId = id || postId || commentId;
  
  if (!objectId) {
    return res.status(400).json({
      success: false,
      message: 'Missing required ID parameter'
    });
  }
  
  if (!objectId.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  next();
};

// Validate document upload data
const validateDocumentUpload = (req, res, next) => {
  const errors = [];

  // Check if file was uploaded
  if (!req.file) {
    errors.push('Document file is required');
  } else {
    // Validate file size (already handled by multer, but double-check)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (req.file.size > maxSize) {
      errors.push('File size must be less than 10MB');
    }

    // Validate file type
    const allowedMimeTypes = [
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/webp',
      'image/tiff',
      'image/bmp',
      'application/pdf'
    ];

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      errors.push('Only image files (JPEG, PNG, WEBP, TIFF, BMP) and PDF files are allowed');
    }
  }

  // Validate document type
  const validDocumentTypes = ['legal_document', 'contract', 'certificate', 'identification', 'other'];
  if (req.body.documentType && !validDocumentTypes.includes(req.body.documentType)) {
    errors.push('Invalid document type. Allowed types: ' + validDocumentTypes.join(', '));
  }

  // Validate language code
  if (req.body.language) {
    if (!ocrService.isLanguageSupported(req.body.language)) {
      errors.push('Unsupported language code. Supported languages: ' + ocrService.getSupportedLanguages().join(', '));
    }
  }

  if (errors.length > 0) {
    // Clean up uploaded file if validation fails
    if (req.file && req.file.path) {
      const fs = require('fs');
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file after validation failure:', cleanupError);
      }
    }

    return res.status(400).json({
      success: false,
      message: 'Document validation failed',
      errors
    });
  }

  // Sanitize document type and language
  if (req.body.documentType) {
    req.body.documentType = req.body.documentType.trim();
  }
  if (req.body.language) {
    req.body.language = req.body.language.trim();
  }

  next();
};

// Validate document parameters (for routes with document ID)
const validateDocumentParams = (req, res, next) => {
  const { id } = req.params;
  
  if (!id) {
    return res.status(400).json({
      success: false,
      message: 'Document ID is required'
    });
  }
  
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document ID format'
    });
  }

  next();
};

// Validate search parameters
const validateSearchParams = (req, res, next) => {
  const { q: searchTerm, page, limit } = req.query;
  const errors = [];

  // Validate search term
  if (!searchTerm || searchTerm.trim().length === 0) {
    errors.push('Search term is required');
  }
  if (searchTerm && searchTerm.length < 2) {
    errors.push('Search term must be at least 2 characters long');
  }
  if (searchTerm && searchTerm.length > 100) {
    errors.push('Search term must be less than 100 characters');
  }

  // Validate pagination parameters
  if (page && (isNaN(page) || parseInt(page) < 1)) {
    errors.push('Page must be a positive integer');
  }
  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 50)) {
    errors.push('Limit must be a positive integer between 1 and 50');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Search validation failed',
      errors
    });
  }

  // Sanitize search term
  if (searchTerm) {
    req.query.q = searchTerm.trim();
  }

  next();
};

// Validate user registration data
const validateUserRegistration = (req, res, next) => {
  const { username, email, password, firstName, lastName } = req.body;
  const errors = [];

  // Username validation
  if (!username || username.trim().length < 3) {
    errors.push('Username must be at least 3 characters long');
  }
  if (username && username.length > 30) {
    errors.push('Username must be less than 30 characters');
  }
  if (username && !/^[a-zA-Z0-9_]+$/.test(username)) {
    errors.push('Username can only contain letters, numbers, and underscores');
  }

  // Email validation
  if (!email || !email.trim()) {
    errors.push('Email is required');
  }
  if (email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
    errors.push('Please enter a valid email address');
  }

  // Password validation
  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  if (password && password.length > 128) {
    errors.push('Password must be less than 128 characters');
  }

  // Name validation
  if (!firstName || firstName.trim().length < 1) {
    errors.push('First name is required');
  }
  if (!lastName || lastName.trim().length < 1) {
    errors.push('Last name is required');
  }
  if (firstName && firstName.length > 50) {
    errors.push('First name must be less than 50 characters');
  }
  if (lastName && lastName.length > 50) {
    errors.push('Last name must be less than 50 characters');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize data
  req.body.username = username.trim();
  req.body.email = email.trim().toLowerCase();
  req.body.firstName = firstName.trim();
  req.body.lastName = lastName.trim();

  next();
};

// Validate user login data
const validateUserLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = [];

  if (!email || !email.trim()) {
    errors.push('Email is required');
  }
  if (!password || !password.trim()) {
    errors.push('Password is required');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  // Sanitize data
  req.body.email = email.trim().toLowerCase();

  next();
};

// Rate limiting middleware (simple implementation)
const createRateLimit = () => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 10; // Max 10 post creations per 15 minutes

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);

    next();
  };
};

// Rate limiting for document uploads (more restrictive)
const createDocumentUploadRateLimit = () => {
  const requests = new Map();
  
  return (req, res, next) => {
    const ip = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    const windowMs = 10 * 60 * 1000; // 10 minutes
    const maxRequests = 5; // Max 5 document uploads per 10 minutes

    if (!requests.has(ip)) {
      requests.set(ip, []);
    }

    const userRequests = requests.get(ip);
    
    // Remove old requests outside the window
    const validRequests = userRequests.filter(time => now - time < windowMs);
    
    if (validRequests.length >= maxRequests) {
      // Clean up uploaded file if rate limited
      if (req.file && req.file.path) {
        const fs = require('fs');
        try {
          fs.unlinkSync(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file after rate limit:', cleanupError);
        }
      }

      return res.status(429).json({
        success: false,
        message: 'Upload rate limit exceeded. Please try again later.',
        retryAfter: Math.ceil((validRequests[0] + windowMs - now) / 1000)
      });
    }

    validRequests.push(now);
    requests.set(ip, validRequests);

    next();
  };
};

module.exports = {
  validateCreatePost,
  validateUpdatePost,
  validateObjectId,
  validateUserRegistration,
  validateUserLogin,
  validateDocumentUpload,
  validateDocumentParams,
  validateSearchParams,
  createRateLimit,
  createDocumentUploadRateLimit
};