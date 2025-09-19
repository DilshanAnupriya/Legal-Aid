import axios, { AxiosProgressEvent } from 'axios';
import {
  Document,
  DocumentUploadResponse,
  DocumentListResponse,
  OCRResponse,
  DocumentFilter,
  UploadProgress
} from '@/types/document';

// Configure base URL - automatically detect the best server URL
const getApiBaseUrl = () => {
  // For Expo development, detect environment and use appropriate URL
  if (__DEV__) {
    // Use localhost for web development, network IP for mobile
    if (typeof window !== 'undefined' && window.location) {
      // Web environment - use localhost
      return 'http://localhost:3000/api';
    } else {
      // Mobile environment - use network IP
      return 'http://10.164.198.42:3000/api';
    }
  }
  
  // For production, use your production API URL
  return 'https://your-production-api.com/api';
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds for file uploads
});

// Add request interceptor for authentication if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = null; // Get from storage/context
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.code === 'ERR_NETWORK') {
      console.error('Network Error: Unable to connect to server at', API_BASE_URL);
      error.message = `Unable to connect to server at ${API_BASE_URL}. Please check if the backend server is running on port 3000.`;
    } else if (error.code === 'ECONNREFUSED') {
      console.error('Connection Refused: Server is not running at', API_BASE_URL);
      error.message = `Server is not available at ${API_BASE_URL}. Please start the backend server on port 3000.`;
    } else if (error.response?.status === 404) {
      console.error('API endpoint not found:', error.config?.url);
      error.message = 'API endpoint not found. Please check if the document routes are properly configured on the server.';
    }
    return Promise.reject(error);
  }
);

// Document service class
export class DocumentService {
  
  /**
   * Test server connectivity
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('Testing connection to server at:', API_BASE_URL);
      // Note: Health endpoint is at /health, not /api/health
      const healthUrl = API_BASE_URL.replace('/api', '') + '/health';
      console.log('Health check URL:', healthUrl);
      
      const response = await api.get('/health', { 
        timeout: 5000,
        baseURL: API_BASE_URL.replace('/api', '') // Remove /api for health endpoint
      });
      console.log('✅ Server connection successful:', response.status);
      return {
        success: true,
        message: `Server is reachable at ${API_BASE_URL}`
      };
    } catch (error: any) {
      console.error('❌ Connection test failed:', error.message);
      console.error('Full error:', error);
      return {
        success: false,
        message: `Server is not reachable at ${API_BASE_URL}. Error: ${error.message}`
      };
    }
  }

  /**
   * Get server health status
   */
  static async getServerHealth(): Promise<any> {
    try {
      const response = await api.get('/health', {
        baseURL: API_BASE_URL.replace('/api', '') // Remove /api for health endpoint
      });
      return response.data;
    } catch (error: any) {
      console.error('Health check failed:', error);
      throw new Error('Server health check failed');
    }
  }
  
  /**
   * Upload a document file
   */
  static async uploadDocument(
    file: any,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<DocumentUploadResponse> {
    try {
      console.log('🚀 Starting document upload:', file.name);
      console.log('📍 Server URL:', API_BASE_URL);
      console.log('📄 File details:', {
        name: file.name,
        type: file.type,
        size: file.size,
        uri: file.uri
      });

      const formData = new FormData();
      
      // Handle file differently for web vs mobile
      let fileToUpload: any;
      
      if (typeof window !== 'undefined' && file.uri) {
        // Web platform - convert URI to Blob
        console.log('🌐 Web platform detected, converting URI to Blob');
        try {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          
          // Create a File object from the blob
          fileToUpload = new File([blob], file.name, {
            type: file.type || 'application/octet-stream'
          });
          
          console.log('📎 Web file prepared:', {
            name: fileToUpload.name,
            type: fileToUpload.type,
            size: fileToUpload.size
          });
        } catch (blobError) {
          console.error('Failed to convert URI to blob:', blobError);
          throw new Error('Failed to prepare file for upload');
        }
      } else {
        // Mobile platform - use original format
        console.log('� Mobile platform detected, using original file format');
        fileToUpload = {
          uri: file.uri,
          type: file.type || 'application/octet-stream',
          name: file.name,
        };
      }
      
      formData.append('document', fileToUpload);
      
      // Add optional metadata
      if (file.category) {
        formData.append('category', file.category);
      }

      // Debug FormData contents
      console.log('📋 FormData entries:');
      try {
        for (let pair of (formData as any).entries()) {
          console.log(`  ${pair[0]}:`, pair[1]);
        }
      } catch {
        console.log('📋 FormData debugging not available');
      }

      const uploadUrl = API_BASE_URL + '/documents/upload';
      console.log('🔗 Making API request to:', uploadUrl);
      
      const response = await api.post('/documents/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Accept': 'application/json',
        },
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress: UploadProgress = {
              loaded: progressEvent.loaded,
              total: progressEvent.total,
              percentage: Math.round((progressEvent.loaded * 100) / progressEvent.total)
            };
            console.log('📈 Upload progress:', progress.percentage + '%');
            onProgress(progress);
          }
        },
        // Increase timeout for larger files
        timeout: 60000 // 60 seconds
      });

      console.log('✅ API response received:', response.status, response.data);

      if (response.data.success) {
        // Transform server response to client format
        const serverData = response.data.data;
        const document: Document = {
          _id: serverData.documentId,
          fileName: serverData.filename,
          originalName: serverData.originalFilename,
          filePath: serverData.fileUrl || serverData.filepath, // Use fileUrl if available
          fileSize: file.size || 0,
          mimeType: file.type,
          uploadDate: new Date(serverData.uploadedAt),
          isProcessed: false
        };

        console.log('Document uploaded successfully:', document);
        return {
          success: true,
          message: response.data.message,
          document
        };
      } else {
        console.error('Upload failed with server error:', response.data);
        return {
          success: false,
          message: response.data.message || 'Upload failed'
        };
      }
    } catch (error: any) {
      console.error('Document upload error:', error);
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          message: 'Upload timed out. The file may be too large or the connection is slow.',
          error: 'Request timeout'
        };
      }
      
      if (error.response) {
        // Server responded with an error
        console.error('Server response error:', error.response.data);
        return {
          success: false,
          message: 'Server rejected the upload',
          error: error.response.data?.message || error.response.statusText
        };
      } 
      
      return {
        success: false,
        message: 'Upload failed',
        error: error.message || 'Network error - unable to connect to server'
      };
    }
  }

  /**
   * Get list of documents with optional filtering
   */
  static async getDocuments(
    page: number = 1,
    limit: number = 20,
    filter?: DocumentFilter
  ): Promise<DocumentListResponse> {
    try {
      const params: any = { page, limit };
      
      if (filter) {
        if (filter.category) params.category = filter.category;
        if (filter.search) params.search = filter.search;
        if (filter.startDate) params.startDate = filter.startDate.toISOString();
        if (filter.endDate) params.endDate = filter.endDate.toISOString();
        if (filter.tags && filter.tags.length > 0) params.tags = filter.tags.join(',');
      }

      const response = await api.get('/documents', { params });
      
      // Transform server response to match client interface
      if (response.data.success) {
        return {
          success: true,
          documents: response.data.data.documents.map(this.transformServerDocument),
          total: response.data.data.pagination.totalDocuments,
          page: response.data.data.pagination.currentPage,
          limit: limit
        };
      } else {
        return {
          success: false,
          documents: [],
          total: 0,
          page,
          limit,
          error: response.data.message || 'Failed to load documents'
        };
      }
    } catch (error: any) {
      console.error('Get documents error:', error);
      
      return {
        success: false,
        documents: [],
        total: 0,
        page,
        limit,
        error: error.response?.data?.message || error.message || 'Network error - unable to connect to server'
      };
    }
  }

  /**
   * Transform server document format to client format
   */
  private static transformServerDocument(serverDoc: any): Document {
    return {
      _id: serverDoc._id,
      fileName: serverDoc.filename,
      originalName: serverDoc.originalFilename,
      filePath: serverDoc.fileUrl || serverDoc.filepath, // Use fileUrl if available, fallback to filepath
      fileSize: serverDoc.fileSize || 0,
      mimeType: serverDoc.mimeType,
      uploadDate: new Date(serverDoc.createdAt),
      category: serverDoc.documentType,
      ocrText: serverDoc.extractedText,
      isProcessed: serverDoc.isProcessed || false,
      thumbnailPath: undefined
    };
  }

  /**
   * Get a specific document by ID
   */
  static async getDocumentById(id: string): Promise<Document | null> {
    try {
      const response = await api.get(`/documents/${id}`);
      return response.data.document;
    } catch (error: any) {
      console.error('Get document error:', error);
      return null;
    }
  }

  /**
   * Delete a document
   */
  static async deleteDocument(id: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await api.delete(`/documents/${id}`);
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error: any) {
      console.error('Delete document error:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Delete failed'
      };
    }
  }

  /**
   * Extract OCR text from document
   */
  static async extractOCRText(documentId: string): Promise<OCRResponse> {
    try {
      const response = await api.post(`/documents/${documentId}/ocr`);
      return response.data;
    } catch (error: any) {
      console.error('OCR extraction error:', error);
      return {
        success: false,
        text: '',
        confidence: 0,
        error: error.response?.data?.message || error.message || 'OCR extraction failed'
      };
    }
  }

  /**
   * Search documents
   */
  static async searchDocuments(query: string): Promise<DocumentListResponse> {
    try {
      const response = await api.get('/documents/search', {
        params: { q: query }
      });
      return response.data;
    } catch (error: any) {
      console.error('Search documents error:', error);
      return {
        success: false,
        documents: [],
        total: 0,
        page: 1,
        limit: 20,
        error: error.response?.data?.message || error.message || 'Search failed'
      };
    }
  }

  /**
   * Download document
   */
  static async downloadDocument(documentId: string): Promise<Blob | null> {
    try {
      const response = await api.get(`/documents/${documentId}/download`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error: any) {
      console.error('Download document error:', error);
      return null;
    }
  }

  /**
   * Update document metadata
   */
  static async updateDocument(
    id: string, 
    updates: Partial<Document>
  ): Promise<{ success: boolean; document?: Document; error?: string }> {
    try {
      const response = await api.patch(`/documents/${id}`, updates);
      return response.data;
    } catch (error: any) {
      console.error('Update document error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Update failed'
      };
    }
  }
}

export default DocumentService;