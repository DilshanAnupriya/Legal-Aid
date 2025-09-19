const Document = require('../models/Document');
const Tesseract = require('tesseract.js');
const fs = require('fs').promises;
const path = require('path');

// Helper function to convert file path to HTTP URL
const getFileUrl = (filepath, req) => {
  if (!filepath) return null;
  
  // Extract the relative path from uploads directory
  const relativePath = filepath.replace(/\\/g, '/').replace(/.*uploads\//, 'uploads/');
  
  // Create full HTTP URL
  const protocol = req.secure ? 'https' : 'http';
  const host = req.get('host');
  return `${protocol}://${host}/${relativePath}`;
};

class DocumentController {
  /**
   * Upload and create a new document
   * POST /api/documents/upload
   */
  async uploadDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Validate required file properties
      if (!req.file.originalname) {
        return res.status(400).json({
          success: false,
          message: 'File must have an original name'
        });
      }

      if (!req.file.filename) {
        return res.status(400).json({
          success: false,
          message: 'File must have a filename'
        });
      }

      if (!req.file.path) {
        return res.status(400).json({
          success: false,
          message: 'File path is missing'
        });
      }

      if (!req.file.mimetype) {
        return res.status(400).json({
          success: false,
          message: 'File MIME type is missing'
        });
      }

      // Map category to valid documentType enum values
      const categoryMap = {
        'Legal': 'legal_document',
        'Contract': 'contract',
        'Certificate': 'certificate',
        'ID': 'identification',
        'Personal': 'other',
        'Business': 'contract',
        'Medical': 'other',
        'Education': 'certificate',
        'General': 'other'
      };

      const documentType = categoryMap[req.body.category] || 'legal_document';

      const documentData = {
        userId: null, // No authentication required
        originalFilename: req.file.originalname,
        filename: req.file.filename,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size || 0,
        documentType: documentType,
        language: req.body.language || 'eng'
      };

      // Create document record
      const document = new Document(documentData);
      const savedDocument = await document.save();

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentId: savedDocument._id,
          filename: savedDocument.filename,
          originalFilename: savedDocument.originalFilename,
          filepath: savedDocument.filepath,
          fileUrl: getFileUrl(savedDocument.filepath, req),
          uploadedAt: savedDocument.createdAt
        }
      });

    } catch (error) {
      // Clean up uploaded file if exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          // Silent cleanup error
        }
      }

      res.status(500).json({
        success: false,
        message: 'Failed to upload document',
        error: error.message
      });
    }
  }

  /**
   * Get document details
   * GET /api/documents/:id
   */
  async getDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await Document.findById(id);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      res.json({
        success: true,
        data: {
          ...document.toObject(),
          fileUrl: getFileUrl(document.filepath, req)
        }
      });

    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all documents
   * GET /api/documents
   */
  async getAllDocuments(req, res) {
    try {
      const { page = 1, limit = 10, category } = req.query;
      
      const filter = {};
      if (category && category !== 'All') {
        filter.category = category;
      }

      const documents = await Document.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      // Add file URLs to documents
      const documentsWithUrls = documents.map(doc => ({
        ...doc.toObject(),
        fileUrl: getFileUrl(doc.filepath, req)
      }));

      const total = await Document.countDocuments(filter);

      res.json({
        success: true,
        data: {
          documents: documentsWithUrls,
          pagination: {
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            totalDocuments: total
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Scan document using OCR
   * POST /api/documents/scan
   */
  async scanDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Document file is required for scanning'
        });
      }

      // Validate required file properties
      if (!req.file.originalname || !req.file.filename || !req.file.path || !req.file.mimetype) {
        return res.status(400).json({
          success: false,
          message: 'File upload incomplete - missing required file properties'
        });
      }

      const language = req.body.language || 'eng';
      
      // Perform OCR using Tesseract.js
      const { data: { text, confidence } } = await Tesseract.recognize(
        req.file.path,
        language
      );

      // Save scanned document to database
      const documentData = {
        userId: null,
        originalFilename: req.file.originalname,
        filename: req.file.filename,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size || 0,
        extractedText: text,
        confidence: Math.round(confidence),
        documentType: 'legal_document',
        language: language,
        isProcessed: true,
        processedAt: new Date(),
        ocrStatus: 'completed'
      };

      const document = new Document(documentData);
      const savedDocument = await document.save();

      res.status(200).json({
        success: true,
        message: 'Document scanned successfully',
        data: {
          document: {
            id: savedDocument._id,
            originalFilename: savedDocument.originalFilename,
            filename: savedDocument.filename,
            isProcessed: savedDocument.isProcessed,
            ocrStatus: savedDocument.ocrStatus,
            createdAt: savedDocument.createdAt
          },
          extractedText: text,
          confidence: Math.round(confidence),
          wordCount: text.split(/\s+/).filter(word => word.length > 0).length,
          characterCount: text.length
        }
      });

    } catch (error) {
      // Clean up uploaded file
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          // Silent cleanup error
        }
      }

      res.status(500).json({
        success: false,
        message: 'Error scanning document',
        error: error.message
      });
    }
  }

  /**
   * Delete document
   * DELETE /api/documents/:id
   */
  async deleteDocument(req, res) {
    try {
      const { id } = req.params;

      const document = await Document.findById(id);
      
      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Delete file from filesystem
      if (document.fileUrl) {
        try {
          await fs.unlink(document.fileUrl);
        } catch (fileError) {
          // Silent file deletion error
        }
      }

      await Document.findByIdAndDelete(id);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get supported languages
   * GET /api/documents/languages
   */
  async getSupportedLanguages(req, res) {
    try {
      const languages = [
        { code: 'eng', name: 'English' },
        { code: 'spa', name: 'Spanish' },
        { code: 'fra', name: 'French' },
        { code: 'deu', name: 'German' },
        { code: 'por', name: 'Portuguese' },
        { code: 'ita', name: 'Italian' },
        { code: 'rus', name: 'Russian' },
        { code: 'chi_sim', name: 'Chinese (Simplified)' },
        { code: 'jpn', name: 'Japanese' },
        { code: 'ara', name: 'Arabic' }
      ];
      
      res.json({
        success: true,
        data: {
          languages,
          default: 'eng'
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supported languages'
      });
    }
  }
}
module.exports = new DocumentController();