const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false,
    default: null
  },
  originalFilename: {
    type: String,
    required: [true, 'Original filename is required']
  },
  filename: {
    type: String,
    required: [true, 'Filename is required'],
    unique: true
  },
  filepath: {
    type: String,
    required: [true, 'File path is required']
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
    required: [true, 'MIME type is required']
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required']
  },
  aiExplanation: {
    type: String,
    default: ''
  },
  explanationLanguage: {
    type: String,
    enum: ['english', 'sinhala', 'tamil'],
    default: 'english'
  },
  aiStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  aiErrorMessage: {
    type: String,
    default: null
  },
  documentType: {
    type: String,
    enum: ['legal_document', 'contract', 'certificate', 'identification', 'other'],
    default: 'legal_document'
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
documentSchema.index({ aiStatus: 1 });
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