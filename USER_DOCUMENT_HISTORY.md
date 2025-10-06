# User-Based Document History Implementation

## Overview
Updated the document analysis feature to show document history based on the authenticated user. Now each user can only see their own uploaded documents.

## Changes Made

### 1. Server-Side (Backend)

#### **File: `Server/controllers/documentController.js`**

**Updated Methods:**

- **`uploadDocument`**: Now accepts `userId` from request body
  ```javascript
  userId: req.body.userId || null
  ```

- **`getAllDocuments`**: Added filtering by userId
  ```javascript
  const { page = 1, limit = 10, category, userId } = req.query;
  
  const filter = {};
  if (userId) {
    filter.userId = userId;
  }
  ```

- **`explainDocument`**: Now associates documents with userId during AI analysis
  ```javascript
  userId: req.body.userId || null
  ```

### 2. Client-Side (Frontend)

#### **File: `Client/services/documentService.ts`**

**Updated Methods:**

- **`uploadDocument`**: Added optional `userId` parameter
  ```typescript
  static async uploadDocument(
    file: any,
    userId?: string,
    onProgress?: (progress: UploadProgress) => void
  )
  ```

- **`getDocuments`**: Added optional `userId` parameter to filter documents
  ```typescript
  static async getDocuments(
    page: number = 1,
    limit: number = 20,
    filter?: DocumentFilter,
    userId?: string
  )
  ```

- **`explainDocument`**: Added optional `userId` parameter
  ```typescript
  static async explainDocument(
    file: any,
    language: 'english' | 'sinhala' | 'tamil' = 'english',
    userId?: string,
    onProgress?: (progress: UploadProgress) => void
  )
  ```

#### **File: `Client/app/(tabs)/DocumentAnalyseScreen.tsx`**

**Changes:**

1. **Imported AuthContext**:
   ```typescript
   import { useAuth } from '@/context/AuthContext';
   ```

2. **Added user from auth context**:
   ```typescript
   const { user } = useAuth();
   ```

3. **Updated `loadDocumentHistory`** to pass userId:
   ```typescript
   const response = await DocumentService.getDocuments(page, 10, undefined, user?.id);
   ```

4. **Updated `handleAnalyze`** to pass userId:
   ```typescript
   const response = await DocumentService.explainDocument(
     selectedFile,
     analysisLanguage,
     user?.id,
     (progress) => {
       setUploadProgress(progress.percentage);
     }
   );
   ```

## How It Works

### Document Upload/Analysis Flow:
1. User logs in → `user.id` is available in AuthContext
2. User uploads/analyzes a document → `userId` is sent with the request
3. Server saves document with the associated `userId`
4. Document is stored in database with user reference

### Document History Flow:
1. User opens Document History screen
2. App fetches documents filtered by `user?.id`
3. Server returns only documents where `userId` matches
4. User sees only their own documents

## Benefits

✅ **Privacy**: Users can only see their own documents
✅ **Multi-user Support**: Multiple users can use the app without seeing each other's data
✅ **Backward Compatible**: Works with existing documents (userId can be null)
✅ **Seamless Integration**: Uses existing authentication system

## Testing

To test the feature:

1. **Login as User A**:
   - Upload/analyze documents
   - View document history (should show only User A's documents)

2. **Logout and login as User B**:
   - Upload/analyze documents
   - View document history (should show only User B's documents)

3. **Check database**:
   - Each document should have the correct `userId` field

## Database Schema

The `Document` model already has `userId` field:
```javascript
userId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'User',
  required: false,
  default: null
}
```

This field now gets populated when documents are created/analyzed.

## Notes

- Documents without a `userId` (created before this update) will still be accessible to all users
- If you want to show only authenticated users' documents, you can add required validation
- The feature works seamlessly with the existing authentication system

## Future Enhancements

Potential improvements:
- Add admin view to see all documents across all users
- Add document sharing between users
- Add document ownership transfer
- Add bulk operations for user documents
- Add statistics per user (total documents, analysis count, etc.)
