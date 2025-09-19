const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFilename: {
    type: String,
    required: true
  },
  filename: {
    type: String,
    required: true,
    unique: true
  },
  filepath: {
    type: String,
    required: true
  },
  cloudinaryUrl: {
    type: String,
    required: false
  },
  cloudinaryPublicId: {
    type: String,
    required: false
  },
  mimeType: {
    type: String,
    required: true
  },
  fileSize: {
    type: Number,
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  ocrStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  ocrErrorMessage: {
    type: String,
    default: null
  },
  confidence: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  documentType: {
    type: String,
    enum: ['legal_document', 'contract', 'certificate', 'identification', 'other'],
    default: 'legal_document'
  },
  language: {
    type: String,
    default: 'eng' // Tesseract language code
  },
  isProcessed: {
    type: Boolean,
    default: false
  },
  processedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for faster queries
documentSchema.index({ userId: 1, createdAt: -1 });
documentSchema.index({ ocrStatus: 1 });
documentSchema.index({ isProcessed: 1 });

// Virtual for document URL
documentSchema.virtual('documentUrl').get(function() {
  if (this.cloudinaryUrl) {
    return this.cloudinaryUrl;
  }
  return `/api/documents/${this._id}/file`;
});

// Ensure virtual fields are serialized
documentSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Document', documentSchema);