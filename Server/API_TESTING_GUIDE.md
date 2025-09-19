# Document Scanner API Testing Guide

## 🚀 Quick Start Testing

### Base URL
```
http://localhost:3000
```

### Authentication Required
All document endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## 📋 Step-by-Step Testing

### 1. First, Get Authentication Token

#### Register New User
**URL:** `POST http://localhost:3000/api/auth/register`
**Body (JSON):**
```json
{
  "email": "testuser@example.com",
  "password": "password123",
  "birthday": "1990-01-01",
  "genderSpectrum": "prefer-not-to-say"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "birthday": "1990-01-01",
    "genderSpectrum": "prefer-not-to-say"
  }'
```

#### OR Login Existing User
**URL:** `POST http://localhost:3000/api/auth/login`
**Body (JSON):**
```json
{
  "email": "testuser@example.com",
  "password": "password123"
}
```

**cURL:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }'
```

**Response (Save the token):**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "66e123456789abcdef123456",
    "email": "testuser@example.com"
  }
}
```

---

### 2. Upload Document for OCR Processing

#### Basic Document Upload
**URL:** `POST http://localhost:3000/api/documents/upload`
**Method:** `POST`
**Content-Type:** `multipart/form-data`

**Form Data:**
- `document` (file): Select an image file (JPG, PNG, WEBP, TIFF, BMP) or PDF
- `documentType` (text): `legal_document` (options: legal_document, contract, certificate, identification, other)
- `language` (text): `eng` (options: eng, spa, fra, deu, ita, por, rus, chi_sim, chi_tra, jpn, kor, ara, hin)

**cURL Example:**
```bash
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@/path/to/your/document.jpg" \
  -F "documentType=legal_document" \
  -F "language=eng"
```

**Response:**
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "documentId": "66e987654321abcdef987654",
    "filename": "contract_example.jpg",
    "status": "pending",
    "uploadedAt": "2025-09-19T07:45:30.123Z"
  }
}
```

#### Upload Different Document Types
```bash
# Contract in Spanish
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@contract_spanish.pdf" \
  -F "documentType=contract" \
  -F "language=spa"

# Certificate in French
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@certificate_french.png" \
  -F "documentType=certificate" \
  -F "language=fra"

# Identification Document
curl -X POST http://localhost:3000/api/documents/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "document=@id_document.jpg" \
  -F "documentType=identification" \
  -F "language=eng"
```

---

### 3. Check Processing Status

**URL:** `GET http://localhost:3000/api/documents/{document_id}/status`

**cURL:**
```bash
curl -X GET http://localhost:3000/api/documents/66e987654321abcdef987654/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "66e987654321abcdef987654",
    "status": "completed",
    "confidence": 87,
    "isProcessed": true,
    "processedAt": "2025-09-19T07:46:15.456Z",
    "errorMessage": null
  }
}
```

**Status Options:**
- `pending`: Just uploaded, waiting for processing
- `processing`: OCR is currently running
- `completed`: Successfully processed
- `failed`: Processing failed (check errorMessage)

---

### 4. Get Extracted Text

**URL:** `GET http://localhost:3000/api/documents/{document_id}/text`

**cURL:**
```bash
curl -X GET http://localhost:3000/api/documents/66e987654321abcdef987654/text \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "documentId": "66e987654321abcdef987654",
    "extractedText": "LEGAL CONTRACT\n\nThis agreement is made between Party A and Party B...",
    "confidence": 87,
    "wordCount": 245,
    "characterCount": 1432
  }
}
```

---

### 5. Get All Documents

**URL:** `GET http://localhost:3000/api/documents`

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `documentType`: Filter by type (legal_document, contract, certificate, identification, other)
- `status`: Filter by OCR status (pending, processing, completed, failed)
- `sortBy`: Sort field (default: createdAt)
- `sortOrder`: asc or desc (default: desc)

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/documents?page=1&limit=5&status=completed" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66e987654321abcdef987654",
      "originalFilename": "contract_example.jpg",
      "documentType": "legal_document",
      "ocrStatus": "completed",
      "confidence": 87,
      "isProcessed": true,
      "createdAt": "2025-09-19T07:45:30.123Z"
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 1,
    "totalDocuments": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```

---

### 6. Search Documents by Text

**URL:** `GET http://localhost:3000/api/documents/search`

**Query Parameters:**
- `q`: Search term (required)
- `type`: Document type filter (optional)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

**cURL:**
```bash
curl -X GET "http://localhost:3000/api/documents/search?q=contract%20terms&type=legal_document" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**More Search Examples:**
```bash
# Search for "agreement"
curl -X GET "http://localhost:3000/api/documents/search?q=agreement" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search for "terms and conditions" in contracts only
curl -X GET "http://localhost:3000/api/documents/search?q=terms%20and%20conditions&type=contract" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Search for "certificate" with pagination
curl -X GET "http://localhost:3000/api/documents/search?q=certificate&page=1&limit=5" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "66e987654321abcdef987654",
      "originalFilename": "contract_example.jpg",
      "extractedText": "LEGAL CONTRACT\n\nThis agreement contains terms and conditions...",
      "documentType": "legal_document",
      "confidence": 87,
      "createdAt": "2025-09-19T07:45:30.123Z"
    }
  ],
  "searchTerm": "contract terms",
  "totalResults": 1
}
```

---

### 7. Additional Useful Endpoints

#### Get Document Details
```bash
curl -X GET http://localhost:3000/api/documents/66e987654321abcdef987654 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Processing Statistics
```bash
curl -X GET http://localhost:3000/api/documents/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Get Supported Languages
```bash
curl -X GET http://localhost:3000/api/documents/languages \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### Reprocess Failed Document
```bash
curl -X POST http://localhost:3000/api/documents/66e987654321abcdef987654/reprocess \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{}'
```

#### Download Original File
```bash
curl -X GET http://localhost:3000/api/documents/66e987654321abcdef987654/file \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output downloaded_document.jpg
```

#### Delete Document
```bash
curl -X DELETE http://localhost:3000/api/documents/66e987654321abcdef987654 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🧪 Postman Testing

### Import Collection
1. Open Postman
2. Click "Import"
3. Select the file: `Legal-Aid-Document-Scanner.postman_collection.json`
4. The collection will be imported with all requests pre-configured

### Environment Variables
Set these variables in Postman:
- `base_url`: `http://localhost:3000`
- `jwt_token`: (will be auto-set after login)
- `document_id`: (will be auto-set after upload)

### Testing Workflow
1. **Run "Register User" or "Login User"** → JWT token is automatically saved
2. **Run "Upload Document"** → Document ID is automatically saved
3. **Run "Check Processing Status"** → Monitor OCR progress
4. **Run "Get Extracted Text"** → Retrieve OCR results
5. **Run "Search Documents"** → Test search functionality

---

## 🔍 Test Data Recommendations

### Sample Documents to Test:
1. **Legal Contract** (.jpg, .png) - English text
2. **Spanish Contract** (.pdf) - Spanish text  
3. **French Certificate** (.png) - French text
4. **Identity Document** (.jpg) - Mixed text
5. **Handwritten Document** (.jpg) - Test OCR limits

### Test Cases:
- ✅ Valid file upload with correct parameters
- ❌ Invalid file type (upload .txt file)
- ❌ File too large (upload >10MB file)
- ❌ Missing authentication token
- ❌ Invalid document ID
- ❌ Unsupported language code
- ✅ Search with various terms
- ✅ Pagination testing
- ✅ Multiple language documents

---

## 📊 Expected Response Times

- **File Upload**: 1-2 seconds
- **OCR Processing**: 5-30 seconds (depending on image size/complexity)
- **Text Retrieval**: <1 second
- **Search**: 1-3 seconds
- **List Documents**: <1 second

---

## 🚨 Common Issues & Solutions

### Issue: "Access token required"
**Solution:** Make sure to include the Authorization header with JWT token

### Issue: "File too large" 
**Solution:** Ensure file is under 10MB for documents, 5MB for images

### Issue: "Document is still being processed"
**Solution:** Wait for OCR processing to complete, check status endpoint

### Issue: "OCR failed"
**Solution:** Try reprocessing or use a clearer image with better text quality

### Issue: "Invalid ID format"
**Solution:** Use valid MongoDB ObjectId (24 character hex string)

Happy testing! 🎉