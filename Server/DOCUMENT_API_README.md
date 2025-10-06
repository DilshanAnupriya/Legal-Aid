# Document API with AI Explanation (Gemini)

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Environment Variables
Create or update `.env` file:
```env
PORT=3000
DB_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
NODE_ENV=development

# Gemini AI API Key (Required for AI explanation)
GEMINI_API_KEY=your_gemini_api_key_here

# Cloudinary (Optional)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Get Gemini API Key (Free)
1. Visit: https://aistudio.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key and add to `.env` as `GEMINI_API_KEY`

### 4. Start Server
```bash
npm start
# or
node index.js
```

## 📋 API Endpoints

### Health Check
```http
GET /health
```

### Get Supported Languages
```http
GET /api/documents/languages
```
Returns: English, Sinhala (සිංහල), Tamil (தமிழ்)

### Upload Document (Simple)
```http
POST /api/documents/upload
Content-Type: multipart/form-data

Fields:
- document: File (PDF, JPG, PNG, TIFF, BMP)
- category: String (Legal, Contract, Certificate, ID, Personal, etc.)
- language: String (english, sinhala, tamil)
```

### Explain Document with AI
```http
POST /api/documents/explain
Content-Type: multipart/form-data

Fields:
- document: PDF File (REQUIRED)
- language: String (english, sinhala, tamil) - Default: english
```

**Response:**
```json
{
  "success": true,
  "message": "Document explained successfully",
  "data": {
    "document": {
      "id": "document_id",
      "originalFilename": "contract.pdf",
      "filename": "document-1234567890.pdf",
      "isProcessed": true,
      "aiStatus": "completed",
      "createdAt": "2025-10-06T10:30:00.000Z"
    },
    "explanation": "Comprehensive AI-generated explanation...",
    "language": "english",
    "confidence": 85,
    "wordCount": 450,
    "characterCount": 2850,
    "documentLength": 5000,
    "truncated": false
  }
}
```

### Get All Documents
```http
GET /api/documents?page=1&limit=10&category=Legal
```

### Get Document by ID
```http
GET /api/documents/:id
```

### Delete Document
```http
DELETE /api/documents/:id
```

## 🧪 Testing

### Using Node.js Test Script
```bash
# Test with default PDF
node test-documents-api.js

# Test with specific PDF
node test-documents-api.js path/to/your/document.pdf
```

### Using Postman
1. Import `postman-documents-collection.json`
2. Set `base_url` variable to `http://localhost:3000`
3. Run the collection

### Using cURL
```bash
# Test health check
curl http://localhost:3000/health

# Get supported languages
curl http://localhost:3000/api/documents/languages

# Explain document (English)
curl -X POST http://localhost:3000/api/documents/explain \
  -F "document=@/path/to/your/document.pdf" \
  -F "language=english"

# Explain document (Sinhala)
curl -X POST http://localhost:3000/api/documents/explain \
  -F "document=@/path/to/your/document.pdf" \
  -F "language=sinhala"

# Explain document (Tamil)
curl -X POST http://localhost:3000/api/documents/explain \
  -F "document=@/path/to/your/document.pdf" \
  -F "language=tamil"
```

## 🔧 Troubleshooting

### Error: "Unexpected end of form"
**Cause:** Body parsing middleware interfering with multipart uploads

**Solution:** ✅ Fixed in latest version
- Removed custom body parsing middleware
- Using standard Express body parsers
- Increased limits for file uploads

**If still occurs:**
1. Make sure you're sending `multipart/form-data`
2. Check file size is under 10MB
3. Restart the server

### Error: "AI service is not configured"
**Cause:** Missing or invalid `GEMINI_API_KEY`

**Solution:**
1. Get API key from https://aistudio.google.com/app/apikey
2. Add to `.env`: `GEMINI_API_KEY=your_key_here`
3. Restart server

### Error: "Only PDF files are allowed"
**Cause:** Trying to explain non-PDF file

**Solution:**
- Use `/api/documents/upload` for other file types
- Use `/api/documents/explain` only for PDFs
- Convert documents to PDF before uploading

### Error: "Failed to extract text from PDF"
**Cause:** PDF is image-based, encrypted, or corrupted

**Solution:**
- Use text-based PDFs (not scanned images)
- Remove password protection
- Try a different PDF file

### Error: "Gemini API quota exceeded"
**Cause:** Free tier API limits reached

**Solution:**
- Wait for quota reset (usually next day)
- Use different API key
- Upgrade to paid tier

### Server won't start
**Check:**
1. MongoDB connection: `DB_URL` in `.env`
2. Port not in use: `netstat -ano | findstr :3000`
3. Node modules installed: `npm install`
4. Node version: `node --version` (requires v14+)

## 📦 Dependencies

### Core
- `express` - Web framework
- `mongoose` - MongoDB ODM
- `multer` - File upload handling
- `cors` - Cross-origin resource sharing

### AI & PDF Processing
- `@google/generative-ai` - Gemini AI SDK
- `pdf-parse` - PDF text extraction

### Removed (Replaced by Gemini)
- ~~`tesseract.js`~~ - OCR (replaced with AI explanation)

## 🌐 Supported Languages

| Language | Code | Native Name |
|----------|------|-------------|
| English  | `english` | English |
| Sinhala  | `sinhala` | සිංහල |
| Tamil    | `tamil` | தமிழ் |

## 📊 AI Explanation Features

The AI provides comprehensive analysis including:

1. **Document Type** - Identifies legal document category
2. **Main Purpose** - Explains document intent
3. **Key Points** - Lists important clauses and terms
4. **Parties Involved** - Identifies all parties
5. **Rights & Obligations** - Explains responsibilities
6. **Important Dates** - Notes deadlines and timeframes
7. **Legal Implications** - Highlights legal consequences
8. **Action Items** - Lists required actions
9. **Risk Factors** - Identifies concerns
10. **Summary** - Provides brief overview

## 🔒 File Upload Limits

- **Max File Size:** 10MB
- **Allowed Types (Upload):** PDF, JPG, PNG, TIFF, BMP
- **Allowed Types (Explain):** PDF only
- **Max Files:** 1 per request

## 📝 Response Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Server Error
- `503` - Service Unavailable (AI not configured)

## 💡 Best Practices

1. **Always check server health before testing**
2. **Use text-based PDFs for best results**
3. **Start with English for testing**
4. **Keep PDFs under 5MB for faster processing**
5. **Monitor API quota usage**
6. **Handle errors gracefully in your app**

## 🆘 Support

For issues:
1. Check server logs
2. Review error messages
3. Test with Postman collection
4. Verify environment variables
5. Check MongoDB connection

## 📄 License

MIT
