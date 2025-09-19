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
    fileSize: 10 * 1024 * 1024 // 10MB limit
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
      cb(new Error('Only images and PDF files are allowed for OCR scanning!'), false);
    }
  }
});

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
  documentController.uploadDocument
);

/**
 * @route   POST /api/documents/scan
 * @desc    Upload and scan a document with OCR
 * @access  Public
 */
router.post('/scan', 
  upload.single('document'),
  documentController.scanDocument
);

/**
 * @route   GET /api/documents
 * @desc    Get all documents
 * @access  Public
 */
router.get('/', documentController.getAllDocuments);

/**
 * @route   GET /api/documents/languages
 * @desc    Get supported OCR languages
 * @access  Public
 */
router.get('/languages', documentController.getSupportedLanguages);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document details by ID
 * @access  Public
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