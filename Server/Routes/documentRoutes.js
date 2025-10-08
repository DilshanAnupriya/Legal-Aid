const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const multer = require('multer');
const path = require('path');

// Configure multer for document uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fields: 10,
    files: 1,
    parts: 12
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = [
      'image/jpeg',
      'image/png',
      'image/jpg',
      'application/pdf',
      'image/tiff',
      'image/bmp'
    ];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only images and PDF files are allowed!'), false);
    }
  }
});

// Multer configuration specifically for AI explanation (PDF only)
const pdfUpload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    fields: 10,
    files: 1,
    parts: 12
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed for AI explanation!'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err) {
    if (err.message) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }
    return res.status(500).json({
      success: false,
      message: 'File upload error'
    });
  }
  next();
};

// Document validation middleware
const validateDocumentParams = (req, res, next) => {
  const { id } = req.params;
  if (!id || !id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({
      success: false,
      message: 'Invalid document ID format'
    });
  }
  next();
};

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a document
 * @access  Public
 */
router.post('/upload', 
  upload.single('document'),
  handleMulterError,
  documentController.uploadDocument
);

/**
 * @route   POST /api/documents/explain
 * @desc    Upload and explain a PDF document with AI (Gemini)
 * @access  Public
 */
router.post('/explain', 
  pdfUpload.single('document'),
  handleMulterError,
  documentController.explainDocument
);

/**
 * @route   GET /api/documents
 * @desc    Get all documents
 * @access  Public
 */
router.get('/', documentController.getAllDocuments);

/**
 * @route   GET /api/documents/history
 * @desc    Get document upload history with filtering and pagination
 * @access  Public
 * @note    Must be defined BEFORE /:id route
 */
router.get('/history', documentController.getUploadHistory);

/**
 * @route   GET /api/documents/stats
 * @desc    Get document statistics
 * @access  Public
 * @note    Must be defined BEFORE /:id route
 */
router.get('/stats', documentController.getDocumentStats);

/**
 * @route   GET /api/documents/languages
 * @desc    Get supported AI explanation languages
 * @access  Public
 * @note    Must be defined BEFORE /:id route
 */
router.get('/languages', documentController.getSupportedLanguages);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document details by ID
 * @access  Public
 * @note    This route uses a parameter, so it must be defined AFTER specific routes
 */
router.get('/:id', 
  validateDocumentParams,
  documentController.getDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document and associated files
 * @access  Public
 */
router.delete('/:id', 
  validateDocumentParams,
  documentController.deleteDocument
);

module.exports = router;