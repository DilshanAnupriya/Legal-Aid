const documentService = require('../Services/documentServices');
const ocrService = require('../Services/ocrServices');
const fs = require('fs').promises;
const path = require('path');

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

      const userId = req.user.userId;
      const documentData = {
        documentType: req.body.documentType || 'legal_document',
        language: req.body.language || 'eng'
      };

      // Validate language
      if (!ocrService.isLanguageSupported(documentData.language)) {
        return res.status(400).json({
          success: false,
          message: 'Unsupported language code',
          supportedLanguages: ocrService.getSupportedLanguages()
        });
      }

      // Create document record
      const document = await documentService.createDocument(
        documentData,
        req.file,
        userId
      );

      // Start OCR processing asynchronously
      processDocumentAsync(document._id);

      res.status(201).json({
        success: true,
        message: 'Document uploaded successfully',
        data: {
          documentId: document._id,
          filename: document.originalFilename,
          status: document.ocrStatus,
          uploadedAt: document.createdAt
        }
      });

    } catch (error) {
      console.error('Upload error:', error);
      
      // Clean up uploaded file if exists
      if (req.file && req.file.path) {
        try {
          await fs.unlink(req.file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
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
      const userId = req.user.userId;

      const document = await documentService.getDocument(id, userId);

      res.json({
        success: true,
        data: document
      });

    } catch (error) {
      console.error('Get document error:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get all documents for user
   * GET /api/documents
   */
  async getUserDocuments(req, res) {
    try {
      const userId = req.user.userId;
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        documentType: req.query.documentType,
        ocrStatus: req.query.status,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc'
      };

      const result = await documentService.getUserDocuments(userId, options);

      res.json({
        success: true,
        data: result.documents,
        pagination: result.pagination
      });

    } catch (error) {
      console.error('Get user documents error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get document processing status
   * GET /api/documents/:id/status
   */
  async getDocumentStatus(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const document = await documentService.getDocument(id, userId);

      res.json({
        success: true,
        data: {
          documentId: document._id,
          status: document.ocrStatus,
          confidence: document.confidence,
          isProcessed: document.isProcessed,
          processedAt: document.processedAt,
          errorMessage: document.ocrErrorMessage
        }
      });

    } catch (error) {
      console.error('Get status error:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get extracted text from document
   * GET /api/documents/:id/text
   */
  async getExtractedText(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const document = await documentService.getDocument(id, userId);

      if (!document.isProcessed) {
        return res.status(202).json({
          success: false,
          message: 'Document is still being processed',
          status: document.ocrStatus
        });
      }

      if (document.ocrStatus === 'failed') {
        return res.status(422).json({
          success: false,
          message: 'Text extraction failed',
          error: document.ocrErrorMessage
        });
      }

      res.json({
        success: true,
        data: {
          documentId: document._id,
          extractedText: document.extractedText,
          confidence: document.confidence,
          wordCount: document.extractedText.split(/\s+/).length,
          characterCount: document.extractedText.length
        }
      });

    } catch (error) {
      console.error('Get text error:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Reprocess document OCR
   * POST /api/documents/:id/reprocess
   */
  async reprocessDocument(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      // Verify document exists and user has access
      const document = await documentService.getDocument(id, userId);

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Start reprocessing
      processDocumentAsync(id);

      res.json({
        success: true,
        message: 'Document reprocessing started',
        data: {
          documentId: id,
          status: 'processing'
        }
      });

    } catch (error) {
      console.error('Reprocess error:', error);
      res.status(500).json({
        success: false,
        message: error.message
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
      const userId = req.user.userId;

      await documentService.deleteDocument(id, userId);

      res.json({
        success: true,
        message: 'Document deleted successfully'
      });

    } catch (error) {
      console.error('Delete document error:', error);
      
      const statusCode = error.message.includes('not found') ? 404 : 500;
      res.status(statusCode).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Search documents by content
   * GET /api/documents/search
   */
  async searchDocuments(req, res) {
    try {
      const userId = req.user.userId;
      const { q: searchTerm, type: documentType, page = 1, limit = 10 } = req.query;

      if (!searchTerm) {
        return res.status(400).json({
          success: false,
          message: 'Search term is required'
        });
      }

      const documents = await documentService.searchDocuments(
        userId,
        searchTerm,
        { documentType, page: parseInt(page), limit: parseInt(limit) }
      );

      res.json({
        success: true,
        data: documents,
        searchTerm,
        totalResults: documents.length
      });

    } catch (error) {
      console.error('Search error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get processing statistics
   * GET /api/documents/stats
   */
  async getProcessingStats(req, res) {
    try {
      const userId = req.user.userId;
      const stats = await documentService.getProcessingStats(userId);

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Get document file (for download)
   * GET /api/documents/:id/file
   */
  async getDocumentFile(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const document = await documentService.getDocument(id, userId);

      // Check if file exists
      if (document.cloudinaryUrl) {
        return res.redirect(document.cloudinaryUrl);
      }

      if (!document.filepath) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      // Serve local file
      try {
        await fs.access(document.filepath);
        res.setHeader('Content-Type', document.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${document.originalFilename}"`);
        res.sendFile(path.resolve(document.filepath));
      } catch (fileError) {
        res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

    } catch (error) {
      console.error('Get file error:', error);
      res.status(500).json({
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
      const languages = ocrService.getSupportedLanguages();
      
      res.json({
        success: true,
        data: {
          languages,
          default: 'eng'
        }
      });

    } catch (error) {
      console.error('Get languages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supported languages'
      });
    }
  }
}

/**
 * Process document asynchronously (helper function)
 * @param {string} documentId - Document ID to process
 */
async function processDocumentAsync(documentId) {
  try {
    console.log(`Starting OCR processing for document ${documentId}`);
    
    const result = await documentService.processDocumentOCR(documentId);
    
    console.log(`OCR processing completed for document ${documentId}`);
    console.log(`Confidence: ${result.ocrResult.confidence}%`);
    console.log(`Text length: ${result.ocrResult.text.length} characters`);
    
    // Optionally upload to Cloudinary after processing
    if (process.env.CLOUDINARY_UPLOAD_AFTER_OCR === 'true') {
      try {
        await documentService.uploadToCloudinary(result.document);
        console.log(`Document ${documentId} uploaded to Cloudinary`);
      } catch (uploadError) {
        console.error(`Cloudinary upload failed for document ${documentId}:`, uploadError);
      }
    }
    
  } catch (error) {
    console.error(`OCR processing failed for document ${documentId}:`, error);
  }
}

module.exports = new DocumentController();