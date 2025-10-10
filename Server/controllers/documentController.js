const Document = require('../models/Document');
const geminiService = require('../Services/geminiService');
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
        explanationLanguage: req.body.language || 'english'
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
   * Explain document using AI (Gemini)
   * POST /api/documents/explain
   */
  async explainDocument(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Document file is required for AI explanation'
        });
      }

      // Validate file is PDF
      if (req.file.mimetype !== 'application/pdf') {
        // Clean up uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          // Silent cleanup error
        }
        
        return res.status(400).json({
          success: false,
          message: 'Only PDF files are supported for AI explanation'
        });
      }

      // Validate required file properties
      if (!req.file.originalname || !req.file.filename || !req.file.path || !req.file.mimetype) {
        return res.status(400).json({
          success: false,
          message: 'File upload incomplete - missing required file properties'
        });
      }

      const language = req.body.language || 'english';
      
      // Validate language
      const supportedLanguages = ['english', 'sinhala', 'tamil'];
      if (!supportedLanguages.includes(language)) {
        return res.status(400).json({
          success: false,
          message: `Unsupported language. Supported languages: ${supportedLanguages.join(', ')}`
        });
      }

      // Check if Gemini AI is configured
      if (!geminiService.isConfigured()) {
        // Clean up uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          // Silent cleanup error
        }
        
        return res.status(503).json({
          success: false,
          message: 'AI service is not configured. Please contact administrator.'
        });
      }

      // Extract text from PDF
      let documentText;
      try {
        documentText = await geminiService.extractTextFromPDF(req.file.path);
        
        if (!documentText || documentText.trim().length === 0) {
          throw new Error('No text could be extracted from the PDF');
        }
      } catch (extractError) {
        // Clean up uploaded file
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          // Silent cleanup error
        }
        
        return res.status(400).json({
          success: false,
          message: 'Failed to extract text from PDF: ' + extractError.message
        });
      }

      // Generate AI explanation
      let aiResult;
      try {
        aiResult = await geminiService.explainLegalDocument(documentText, language);
      } catch (aiError) {
        // Save document with error status
        const documentData = {
          userId: null,
          originalFilename: req.file.originalname,
          filename: req.file.filename,
          filepath: req.file.path,
          mimeType: req.file.mimetype,
          fileSize: req.file.size || 0,
          documentType: 'legal_document',
          explanationLanguage: language,
          aiStatus: 'failed',
          aiErrorMessage: aiError.message,
          isProcessed: false
        };

        const document = new Document(documentData);
        await document.save();

        // Determine appropriate status code based on error type
        let statusCode = 500;
        let userMessage = 'AI explanation failed';

        if (aiError.message.includes('overloaded') || aiError.message.includes('503')) {
          statusCode = 503;
          userMessage = 'AI service is currently busy. Please try again in a few moments.';
        } else if (aiError.message.includes('quota') || aiError.message.includes('429')) {
          statusCode = 429;
          userMessage = 'AI service quota exceeded. Please try again later.';
        } else if (aiError.message.includes('API key')) {
          statusCode = 500;
          userMessage = 'AI service configuration error. Please contact support.';
        } else if (aiError.message.includes('safety')) {
          statusCode = 400;
          userMessage = 'Document content was blocked by safety filters. Please try with a different document.';
        }

        return res.status(statusCode).json({
          success: false,
          message: userMessage,
          error: aiError.message,
          errorType: statusCode === 503 ? 'service_overloaded' : 
                     statusCode === 429 ? 'quota_exceeded' :
                     statusCode === 400 ? 'content_blocked' : 'unknown',
          documentId: document._id // Return document ID for potential retry
        });
      }

      // Save document with AI explanation
      const documentData = {
        userId: null,
        originalFilename: req.file.originalname,
        filename: req.file.filename,
        filepath: req.file.path,
        mimeType: req.file.mimetype,
        fileSize: req.file.size || 0,
        aiExplanation: aiResult.explanation,
        explanationLanguage: language,
        documentType: 'legal_document',
        isProcessed: true,
        processedAt: new Date(),
        aiStatus: 'completed'
      };

      const document = new Document(documentData);
      const savedDocument = await document.save();

      res.status(200).json({
        success: true,
        message: 'Document explained successfully',
        data: {
          document: {
            id: savedDocument._id,
            originalFilename: savedDocument.originalFilename,
            filename: savedDocument.filename,
            isProcessed: savedDocument.isProcessed,
            aiStatus: savedDocument.aiStatus,
            createdAt: savedDocument.createdAt
          },
          explanation: aiResult.explanation,
          language: aiResult.language,
          confidence: aiResult.confidence,
          wordCount: aiResult.wordCount,
          characterCount: aiResult.characterCount,
          documentLength: aiResult.documentLength,
          truncated: aiResult.truncated
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
        message: 'Error explaining document',
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
   * Get supported languages for AI explanation
   * GET /api/documents/languages
   */
  async getSupportedLanguages(req, res) {
    try {
      const languages = geminiService.getSupportedLanguages();
      
      res.json({
        success: true,
        data: {
          languages,
          default: 'english'
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supported languages'
      });
    }
  }

  /**
   * Get document upload history
   * GET /api/documents/history
   */
  async getUploadHistory(req, res) {
    try {
      const { page = 1, limit = 20, userId, status, language } = req.query;
      
      const filter = {};
      
      // Filter by userId if provided
      if (userId) {
        filter.userId = userId;
      }
      
      // Filter by AI status if provided
      if (status && ['pending', 'processing', 'completed', 'failed'].includes(status)) {
        filter.aiStatus = status;
      }
      
      // Filter by explanation language if provided
      if (language && ['english', 'sinhala', 'tamil'].includes(language)) {
        filter.explanationLanguage = language;
      }

      const documents = await Document.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .select('-__v'); // Exclude version field

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
            totalDocuments: total,
            documentsPerPage: parseInt(limit)
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch document history',
        error: error.message
      });
    }
  }

  /**
   * Get document statistics
   * GET /api/documents/stats
   */
  async getDocumentStats(req, res) {
    try {
      const { userId } = req.query;
      
      const filter = userId ? { userId } : {};
      
      // Get counts by status
      const totalDocuments = await Document.countDocuments(filter);
      const processedDocuments = await Document.countDocuments({ ...filter, isProcessed: true });
      const pendingDocuments = await Document.countDocuments({ ...filter, aiStatus: 'pending' });
      const failedDocuments = await Document.countDocuments({ ...filter, aiStatus: 'failed' });
      
      // Get counts by language
      const englishDocs = await Document.countDocuments({ ...filter, explanationLanguage: 'english' });
      const sinhalaDocs = await Document.countDocuments({ ...filter, explanationLanguage: 'sinhala' });
      const tamilDocs = await Document.countDocuments({ ...filter, explanationLanguage: 'tamil' });
      
      // Get counts by document type
      const legalDocs = await Document.countDocuments({ ...filter, documentType: 'legal_document' });
      const contractDocs = await Document.countDocuments({ ...filter, documentType: 'contract' });
      const certDocs = await Document.countDocuments({ ...filter, documentType: 'certificate' });
      const idDocs = await Document.countDocuments({ ...filter, documentType: 'identification' });
      const otherDocs = await Document.countDocuments({ ...filter, documentType: 'other' });
      
      res.json({
        success: true,
        data: {
          total: totalDocuments,
          processed: processedDocuments,
          pending: pendingDocuments,
          failed: failedDocuments,
          byLanguage: {
            english: englishDocs,
            sinhala: sinhalaDocs,
            tamil: tamilDocs
          },
          byType: {
            legal_document: legalDocs,
            contract: contractDocs,
            certificate: certDocs,
            identification: idDocs,
            other: otherDocs
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch document statistics',
        error: error.message
      });
    }
  }
}
module.exports = new DocumentController();