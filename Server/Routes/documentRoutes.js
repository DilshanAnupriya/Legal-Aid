const express = require('express');
const router = express.Router();
const documentController = require('../controllers/documentController');
const { authenticateToken } = require('../middleware/authmiddleware');
const { documentUpload } = require('../config/multer');
const { validateDocumentUpload, validateDocumentParams } = require('../middleware/validation');

// Apply auth middleware to all document routes
router.use(authenticateToken);

/**
 * @route   POST /api/documents/upload
 * @desc    Upload a document for OCR processing
 * @access  Private
 * @body    {file} document - Image file (jpg, png, pdf)
 * @body    {string} documentType - Type of document (optional)
 * @body    {string} language - OCR language code (optional, default: 'eng')
 */
router.post('/upload', 
  documentUpload.single('document'),
  validateDocumentUpload,
  documentController.uploadDocument
);

/**
 * @route   GET /api/documents
 * @desc    Get all documents for authenticated user
 * @access  Private
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 * @query   {string} documentType - Filter by document type
 * @query   {string} status - Filter by OCR status
 * @query   {string} sortBy - Sort field (default: 'createdAt')
 * @query   {string} sortOrder - Sort order 'asc' or 'desc' (default: 'desc')
 */
router.get('/', documentController.getUserDocuments);

/**
 * @route   GET /api/documents/search
 * @desc    Search documents by extracted text content
 * @access  Private
 * @query   {string} q - Search term (required)
 * @query   {string} type - Document type filter (optional)
 * @query   {number} page - Page number (default: 1)
 * @query   {number} limit - Items per page (default: 10)
 */
router.get('/search', documentController.searchDocuments);

/**
 * @route   GET /api/documents/stats
 * @desc    Get processing statistics for user's documents
 * @access  Private
 */
router.get('/stats', documentController.getProcessingStats);

/**
 * @route   GET /api/documents/languages
 * @desc    Get supported OCR languages
 * @access  Private
 */
router.get('/languages', documentController.getSupportedLanguages);

/**
 * @route   GET /api/documents/:id
 * @desc    Get document details by ID
 * @access  Private
 * @params  {string} id - Document ID
 */
router.get('/:id', 
  validateDocumentParams,
  documentController.getDocument
);

/**
 * @route   GET /api/documents/:id/status
 * @desc    Get document processing status
 * @access  Private
 * @params  {string} id - Document ID
 */
router.get('/:id/status', 
  validateDocumentParams,
  documentController.getDocumentStatus
);

/**
 * @route   GET /api/documents/:id/text
 * @desc    Get extracted text from processed document
 * @access  Private
 * @params  {string} id - Document ID
 */
router.get('/:id/text', 
  validateDocumentParams,
  documentController.getExtractedText
);

/**
 * @route   GET /api/documents/:id/file
 * @desc    Download or view document file
 * @access  Private
 * @params  {string} id - Document ID
 */
router.get('/:id/file', 
  validateDocumentParams,
  documentController.getDocumentFile
);

/**
 * @route   POST /api/documents/:id/reprocess
 * @desc    Reprocess document OCR
 * @access  Private
 * @params  {string} id - Document ID
 */
router.post('/:id/reprocess', 
  validateDocumentParams,
  documentController.reprocessDocument
);

/**
 * @route   DELETE /api/documents/:id
 * @desc    Delete document and associated files
 * @access  Private
 * @params  {string} id - Document ID
 */
router.delete('/:id', 
  validateDocumentParams,
  documentController.deleteDocument
);

module.exports = router;