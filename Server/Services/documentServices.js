const Document = require('../models/Document');
const ocrService = require('./ocrServices');
const cloudinary = require('../config/cloudinary');
const fs = require('fs').promises;
const path = require('path');

class DocumentService {
  /**
   * Create a new document record
   * @param {Object} documentData - Document metadata
   * @param {Object} file - Uploaded file object
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Created document
   */
  async createDocument(documentData, file, userId) {
    try {
      const document = new Document({
        userId,
        originalFilename: file.originalname,
        filename: file.filename,
        filepath: file.path,
        mimeType: file.mimetype,
        fileSize: file.size,
        documentType: documentData.documentType || 'legal_document',
        language: documentData.language || 'eng',
        ocrStatus: 'pending'
      });

      await document.save();
      return document;
    } catch (error) {
      console.error('Error creating document:', error);
      throw new Error('Failed to create document record');
    }
  }

  /**
   * Upload document to Cloudinary
   * @param {Object} document - Document record
   * @returns {Promise<Object>} Updated document with Cloudinary URLs
   */
  async uploadToCloudinary(document) {
    try {
      const result = await cloudinary.uploader.upload(document.filepath, {
        folder: 'legal-aid/documents',
        resource_type: 'image',
        public_id: `doc_${document._id}`,
        format: 'jpg',
        quality: 'auto:best'
      });

      document.cloudinaryUrl = result.secure_url;
      document.cloudinaryPublicId = result.public_id;
      await document.save();

      return document;
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload document to cloud storage');
    }
  }

  /**
   * Process document with OCR
   * @param {string} documentId - Document ID
   * @param {Object} options - OCR options
   * @returns {Promise<Object>} Updated document with extracted text
   */
  async processDocumentOCR(documentId, options = {}) {
    try {
      const document = await Document.findById(documentId);
      if (!document) {
        throw new Error('Document not found');
      }

      // Update status to processing
      document.ocrStatus = 'processing';
      await document.save();

      // Extract text using OCR
      const ocrResult = await ocrService.extractTextWithRetry(
        document.filepath,
        {
          language: document.language,
          ...options
        }
      );

      // Update document with OCR results
      document.extractedText = ocrResult.text;
      document.confidence = ocrResult.confidence;
      document.ocrStatus = 'completed';
      document.isProcessed = true;
      document.processedAt = new Date();
      document.ocrErrorMessage = null;

      await document.save();

      return {
        document,
        ocrResult
      };

    } catch (error) {
      console.error('OCR processing error:', error);
      
      // Update document with error status
      try {
        await Document.findByIdAndUpdate(documentId, {
          ocrStatus: 'failed',
          ocrErrorMessage: error.message
        });
      } catch (updateError) {
        console.error('Error updating document status:', updateError);
      }

      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Get document by ID with user authorization
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID for authorization
   * @returns {Promise<Object>} Document record
   */
  async getDocument(documentId, userId) {
    try {
      const document = await Document.findOne({
        _id: documentId,
        userId: userId
      }).populate('userId', 'name email');

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      return document;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw new Error('Failed to fetch document');
    }
  }

  /**
   * Get all documents for a user
   * @param {string} userId - User ID
   * @param {Object} options - Query options (pagination, filters)
   * @returns {Promise<Object>} Documents with pagination info
   */
  async getUserDocuments(userId, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        documentType,
        ocrStatus,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = options;

      const query = { userId };
      
      if (documentType) {
        query.documentType = documentType;
      }
      
      if (ocrStatus) {
        query.ocrStatus = ocrStatus;
      }

      const skip = (page - 1) * limit;
      const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

      const [documents, totalCount] = await Promise.all([
        Document.find(query)
          .sort(sort)
          .skip(skip)
          .limit(parseInt(limit))
          .select('-filepath'), // Exclude file path for security
        Document.countDocuments(query)
      ]);

      return {
        documents,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCount / limit),
          totalDocuments: totalCount,
          hasNext: skip + documents.length < totalCount,
          hasPrev: page > 1
        }
      };

    } catch (error) {
      console.error('Error fetching user documents:', error);
      throw new Error('Failed to fetch documents');
    }
  }

  /**
   * Delete document and cleanup files
   * @param {string} documentId - Document ID
   * @param {string} userId - User ID for authorization
   * @returns {Promise<boolean>} Deletion success
   */
  async deleteDocument(documentId, userId) {
    try {
      const document = await Document.findOne({
        _id: documentId,
        userId: userId
      });

      if (!document) {
        throw new Error('Document not found or access denied');
      }

      // Delete from Cloudinary if uploaded
      if (document.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(document.cloudinaryPublicId);
        } catch (cloudinaryError) {
          console.error('Error deleting from Cloudinary:', cloudinaryError);
        }
      }

      // Delete local file if exists
      if (document.filepath) {
        try {
          await fs.unlink(document.filepath);
        } catch (fileError) {
          console.error('Error deleting local file:', fileError);
        }
      }

      // Delete document record
      await Document.findByIdAndDelete(documentId);

      return true;
    } catch (error) {
      console.error('Error deleting document:', error);
      throw new Error('Failed to delete document');
    }
  }

  /**
   * Search documents by text content
   * @param {string} userId - User ID
   * @param {string} searchTerm - Search term
   * @param {Object} options - Search options
   * @returns {Promise<Array>} Matching documents
   */
  async searchDocuments(userId, searchTerm, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        documentType
      } = options;

      const query = {
        userId,
        extractedText: { $regex: searchTerm, $options: 'i' },
        isProcessed: true
      };

      if (documentType) {
        query.documentType = documentType;
      }

      const skip = (page - 1) * limit;

      const documents = await Document.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-filepath');

      return documents;
    } catch (error) {
      console.error('Error searching documents:', error);
      throw new Error('Failed to search documents');
    }
  }

  /**
   * Get OCR processing statistics
   * @param {string} userId - User ID (optional)
   * @returns {Promise<Object>} Processing statistics
   */
  async getProcessingStats(userId = null) {
    try {
      const query = userId ? { userId } : {};

      const stats = await Document.aggregate([
        { $match: query },
        {
          $group: {
            _id: '$ocrStatus',
            count: { $sum: 1 },
            avgConfidence: { $avg: '$confidence' }
          }
        }
      ]);

      const totalDocuments = await Document.countDocuments(query);
      
      return {
        totalDocuments,
        statusBreakdown: stats,
        ocrServiceStats: ocrService.getStats()
      };
    } catch (error) {
      console.error('Error fetching processing stats:', error);
      throw new Error('Failed to fetch processing statistics');
    }
  }

  /**
   * Reprocess failed documents
   * @param {string} userId - User ID
   * @returns {Promise<Array>} Reprocessed documents
   */
  async reprocessFailedDocuments(userId) {
    try {
      const failedDocuments = await Document.find({
        userId,
        ocrStatus: 'failed'
      });

      const reprocessedResults = [];

      for (const document of failedDocuments) {
        try {
          const result = await this.processDocumentOCR(document._id);
          reprocessedResults.push({
            documentId: document._id,
            success: true,
            result
          });
        } catch (error) {
          reprocessedResults.push({
            documentId: document._id,
            success: false,
            error: error.message
          });
        }
      }

      return reprocessedResults;
    } catch (error) {
      console.error('Error reprocessing documents:', error);
      throw new Error('Failed to reprocess documents');
    }
  }
}

module.exports = new DocumentService();