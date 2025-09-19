# AI Document Scanner Feature - Legal Aid Backend

## Overview
This feature provides AI-powered document scanning and OCR (Optical Character Recognition) capabilities for the Legal Aid application. Users can upload legal documents, which are then processed using Tesseract.js to extract text content.

## Features Implemented

### 🔍 Core Functionality
- **Document Upload**: Support for images (JPEG, PNG, WEBP, TIFF, BMP) and PDF files
- **OCR Processing**: Automatic text extraction using Tesseract.js with image preprocessing
- **Text Search**: Search through extracted text content across all user documents
- **Document Management**: Full CRUD operations for document records
- **Cloud Storage**: Optional Cloudinary integration for file storage
- **Multi-language Support**: OCR processing in 13+ languages

### 🛠️ Technical Implementation

#### 1. Database Model (`models/Document.js`)
```javascript
{
  userId: ObjectId (ref: User),
  originalFilename: String,
  filename: String,
  filepath: String,
  cloudinaryUrl: String,
  extractedText: String,
  ocrStatus: enum ['pending', 'processing', 'completed', 'failed'],
  confidence: Number (0-100),
  documentType: enum,
  language: String,
  isProcessed: Boolean,
  // ... timestamps and metadata
}
```

#### 2. OCR Service (`Services/ocrServices.js`)
- **Image Preprocessing**: Uses Sharp for image optimization
  - Resize to max 2000px height
  - Convert to grayscale
  - Normalize and sharpen
  - Apply threshold for better OCR accuracy
- **Text Extraction**: Tesseract.js with configurable options
- **Error Handling**: Retry mechanism for failed OCR attempts
- **Text Cleaning**: Post-processing to improve extracted text quality

#### 3. Document Service (`Services/documentServices.js`)
- **Document Management**: Create, read, update, delete operations
- **OCR Processing**: Async processing with status tracking
- **Cloudinary Integration**: Optional cloud storage upload
- **Search Functionality**: Text-based document search
- **Statistics**: Processing analytics and metrics

#### 4. API Endpoints (`Routes/documentRoutes.js`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/documents/upload` | Upload document for OCR processing |
| GET | `/api/documents` | Get all user documents (paginated) |
| GET | `/api/documents/:id` | Get specific document details |
| GET | `/api/documents/:id/status` | Check OCR processing status |
| GET | `/api/documents/:id/text` | Get extracted text content |
| GET | `/api/documents/:id/file` | Download original document file |
| POST | `/api/documents/:id/reprocess` | Reprocess failed OCR |
| DELETE | `/api/documents/:id` | Delete document and files |
| GET | `/api/documents/search?q=term` | Search documents by text |
| GET | `/api/documents/stats` | Get processing statistics |
| GET | `/api/documents/languages` | Get supported OCR languages |

### 🔐 Security & Validation

#### File Upload Security
- **File Type Validation**: Only allow specific image and PDF formats
- **File Size Limits**: 10MB for documents, 5MB for images
- **Rate Limiting**: 5 uploads per 10 minutes per IP
- **Path Sanitization**: Secure file naming and storage

#### Input Validation
- **Document Type**: Enum validation for legal document categories
- **Language Code**: Validation against supported Tesseract languages
- **MongoDB ObjectId**: Proper ID format validation
- **Search Parameters**: Length and content validation

### 📁 File Structure
```
Server/
├── models/
│   └── Document.js           # Document data model
├── Services/
│   ├── documentServices.js   # Business logic layer
│   └── ocrServices.js        # OCR processing service
├── controllers/
│   └── documentController.js # API request handlers
├── Routes/
│   └── documentRoutes.js     # API route definitions
├── middleware/
│   └── validation.js         # Enhanced with document validation
├── config/
│   └── multer.js            # Enhanced with document upload config
└── uploads/
    └── documents/           # Local file storage
```

### 🌍 Supported Languages
- English (eng) - Default
- Spanish (spa)
- French (fra)
- German (deu)
- Italian (ita)
- Portuguese (por)
- Russian (rus)
- Chinese Simplified (chi_sim)
- Chinese Traditional (chi_tra)
- Japanese (jpn)
- Korean (kor)
- Arabic (ara)
- Hindi (hin)

## Usage Examples

### 1. Upload Document
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@legal_contract.jpg" \
  -F "documentType=contract" \
  -F "language=eng"
```

### 2. Check Processing Status
```bash
curl -X GET http://localhost:3000/api/documents/DOCUMENT_ID/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 3. Get Extracted Text
```bash
curl -X GET http://localhost:3000/api/documents/DOCUMENT_ID/text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 4. Search Documents
```bash
curl -X GET "http://localhost:3000/api/documents/search?q=contract terms" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Configuration

### Environment Variables
```env
# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CLOUDINARY_UPLOAD_AFTER_OCR=true

# MongoDB
DB_URL=mongodb://localhost:27017/legal-aid

# JWT
JWT_SECRET=your_jwt_secret
```

### OCR Configuration
The OCR service can be configured with different parameters:
- **Page Segmentation Mode (PSM)**: Default "6" (uniform text blocks)
- **OCR Engine Mode (OEM)**: Default "3" (both neural nets and legacy)
- **Language**: Configurable per document upload
- **Character Whitelist**: Predefined safe character set

## Performance Considerations

### Memory Usage
- **Image Preprocessing**: Sharp operations are memory-intensive
- **OCR Processing**: Tesseract can use significant RAM for large images
- **Concurrent Processing**: Limited to 2 simultaneous OCR operations

### Storage
- **Local Storage**: Files stored in `uploads/documents/`
- **Cloudinary**: Optional cloud storage for scalability
- **Cleanup**: Automatic cleanup of old files (configurable)

### Processing Time
- **Small Images**: 2-5 seconds
- **Large Documents**: 10-30 seconds
- **PDF Files**: Varies by page count and complexity

## Error Handling

### OCR Errors
- **Failed Processing**: Documents marked with `ocrStatus: 'failed'`
- **Low Confidence**: Retry mechanism for confidence < 30%
- **File Corruption**: Graceful handling with error messages

### API Errors
- **400 Bad Request**: Validation failures, unsupported file types
- **401 Unauthorized**: Missing or invalid JWT tokens
- **404 Not Found**: Document not found or access denied
- **413 Payload Too Large**: File size exceeds limits
- **429 Too Many Requests**: Rate limiting triggered
- **500 Internal Server Error**: Processing failures, server errors

## Monitoring & Analytics

### Document Statistics
- Total documents processed
- OCR success/failure rates
- Average confidence scores
- Processing time metrics

### Usage Metrics
- Upload frequency per user
- Most common document types
- Language distribution
- Search query analytics

## Future Enhancements

### Planned Features
1. **PDF Text Extraction**: Direct PDF text extraction before OCR
2. **Batch Processing**: Multiple document upload and processing
3. **Document Classification**: AI-powered document type detection
4. **Template Matching**: Legal document template recognition
5. **Webhook Notifications**: Real-time processing status updates
6. **API Key Authentication**: Alternative to JWT for external integrations

### Optimization Opportunities
1. **Caching**: Redis for frequently accessed documents
2. **Queue System**: Background job processing with Bull or Agenda
3. **CDN Integration**: Faster file delivery through CDN
4. **Microservices**: Separate OCR service for better scalability
5. **GPU Acceleration**: Hardware acceleration for faster processing

## Deployment Notes

### Dependencies
- Node.js 16+
- MongoDB 4.4+
- Sharp (native binaries)
- Tesseract.js
- Optional: Redis for caching

### Production Considerations
- **File Storage**: Use cloud storage (Cloudinary, AWS S3) in production
- **Load Balancing**: Distribute OCR processing across multiple instances
- **Monitoring**: Add comprehensive logging and monitoring
- **Backup**: Regular backup of document metadata and files
- **Security**: Implement additional security headers and HTTPS

---

## Installation Complete ✅

The AI Document Scanner feature has been successfully integrated into your Legal Aid backend. All components are properly configured and ready for use. Start your server with `npm start` and begin uploading documents for OCR processing!