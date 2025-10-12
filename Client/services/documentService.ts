import axios, { AxiosProgressEvent } from 'axios';
import {
  Document,
  DocumentUploadResponse,
  DocumentListResponse,
  AIExplanationResponse,
  DocumentFilter,
  UploadProgress,
  SupportedLanguage
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
      aiExplanation: serverDoc.aiExplanation,
      explanationLanguage: serverDoc.explanationLanguage,
      aiStatus: serverDoc.aiStatus,
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
   * Explain PDF document using AI (Gemini)
   * @param file - PDF file to explain
   * @param language - Language for explanation (english, sinhala, tamil)
   * @param onProgress - Progress callback
   */
  static async explainDocument(
    file: any,
    language: 'english' | 'sinhala' | 'tamil' = 'english',
    onProgress?: (progress: UploadProgress) => void
  ): Promise<AIExplanationResponse> {
    try {
      console.log('🚀 Starting document explanation:', file.name);
      console.log('📍 Server URL:', API_BASE_URL);
      console.log('🌐 Language:', language);

      // Validate file is PDF
      if (file.type !== 'application/pdf') {
        return {
          success: false,
          explanation: '',
          language: language,
          confidence: 0,
          wordCount: 0,
          characterCount: 0,
          error: 'Only PDF files are supported for AI explanation'
        };
      }

      const formData = new FormData();
      
      // Handle file differently for web vs mobile
      let fileToUpload: any;
      
      if (typeof window !== 'undefined' && file.uri) {
        // Web platform - convert URI to Blob
        console.log('🌐 Web platform detected, converting URI to Blob');
        try {
          const response = await fetch(file.uri);
          const blob = await response.blob();
          
          fileToUpload = new File([blob], file.name, {
            type: 'application/pdf'
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
        console.log('📱 Mobile platform detected, using original file format');
        fileToUpload = {
          uri: file.uri,
          type: 'application/pdf',
          name: file.name,
        };
      }
      
      formData.append('document', fileToUpload);
      formData.append('language', language);

      const uploadUrl = API_BASE_URL + '/documents/explain';
      console.log('🔗 Making API request to:', uploadUrl);
      
      const response = await api.post('/documents/explain', formData, {
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
        timeout: 120000 // 2 minutes for AI processing
      });

      console.log('✅ API response received:', response.status, response.data);

      if (response.data.success) {
        return {
          success: true,
          explanation: response.data.data.explanation,
          language: response.data.data.language,
          confidence: response.data.data.confidence,
          wordCount: response.data.data.wordCount,
          characterCount: response.data.data.characterCount
        };
      } else {
        console.error('AI explanation failed with server error:', response.data);
        
        // Handle specific error types
        let userFriendlyMessage = response.data.message || 'AI explanation failed';
        
        if (response.data.errorType === 'service_overloaded') {
          userFriendlyMessage = 'AI service is currently busy. Please try again in a few moments.';
        } else if (response.data.errorType === 'quota_exceeded') {
          userFriendlyMessage = 'AI service quota exceeded. Please try again later.';
        } else if (response.data.errorType === 'content_blocked') {
          userFriendlyMessage = 'Document content was blocked by safety filters. Please try with a different document.';
        }
        
        return {
          success: false,
          explanation: '',
          language: language,
          confidence: 0,
          wordCount: 0,
          characterCount: 0,
          error: userFriendlyMessage,
          errorType: response.data.errorType,
          documentId: response.data.documentId // For potential retry
        };
      }
    } catch (error: any) {
      console.error('Document explanation error:', error);
      
      if (error.code === 'ECONNABORTED') {
        return {
          success: false,
          explanation: '',
          language: language,
          confidence: 0,
          wordCount: 0,
          characterCount: 0,
          error: 'Request timed out. The document may be too large or the server is busy.'
        };
      }
      
      if (error.response) {
        console.error('Server response error:', error.response.data);
        
        // Handle specific error types from server
        let userFriendlyMessage = error.response.data?.message || error.response.statusText;
        let errorType: any = 'unknown';
        
        if (error.response.status === 503) {
          userFriendlyMessage = 'AI service is currently busy. Please try again in a few moments.';
          errorType = 'service_overloaded';
        } else if (error.response.status === 429) {
          userFriendlyMessage = 'Too many requests. Please wait a moment and try again.';
          errorType = 'quota_exceeded';
        }
        
        return {
          success: false,
          explanation: '',
          language: language,
          confidence: 0,
          wordCount: 0,
          characterCount: 0,
          error: userFriendlyMessage,
          errorType: error.response.data?.errorType || errorType,
          documentId: error.response.data?.documentId
        };
      }
      
      return {
        success: false,
        explanation: '',
        language: language,
        confidence: 0,
        wordCount: 0,
        characterCount: 0,
        error: error.message || 'Network error - unable to connect to server'
      };
    }
  }

  /**
   * Get supported languages for AI explanation
   */
  static async getSupportedLanguages(): Promise<{ success: boolean; languages: SupportedLanguage[]; error?: string }> {
    try {
      const response = await api.get('/documents/languages');
      
      if (response.data.success) {
        return {
          success: true,
          languages: response.data.data.languages
        };
      } else {
        return {
          success: false,
          languages: [],
          error: response.data.message || 'Failed to load supported languages'
        };
      }
    } catch (error: any) {
      console.error('Get supported languages error:', error);
      return {
        success: false,
        languages: [],
        error: error.response?.data?.message || error.message || 'Failed to load supported languages'
      };
    }
  }

  /**
   * Get document upload history with filtering and pagination
   */
  static async getUploadHistory(
    page: number = 1,
    limit: number = 20,
    filters?: {
      userId?: string;
      status?: 'pending' | 'processing' | 'completed' | 'failed';
      language?: 'english' | 'sinhala' | 'tamil';
    }
  ): Promise<DocumentListResponse> {
    try {
      const params: any = { page, limit };
      
      if (filters) {
        if (filters.userId) params.userId = filters.userId;
        if (filters.status) params.status = filters.status;
        if (filters.language) params.language = filters.language;
      }

      const response = await api.get('/documents/history', { params });
      
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
          error: response.data.message || 'Failed to load document history'
        };
      }
    } catch (error: any) {
      console.error('Get upload history error:', error);
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
   * Get document statistics
   */
  static async getDocumentStats(userId?: string): Promise<{
    success: boolean;
    stats?: {
      total: number;
      processed: number;
      pending: number;
      failed: number;
      byLanguage: {
        english: number;
        sinhala: number;
        tamil: number;
      };
      byType: {
        legal_document: number;
        contract: number;
        certificate: number;
        identification: number;
        other: number;
      };
    };
    error?: string;
  }> {
    try {
      const params: any = {};
      if (userId) params.userId = userId;

      const response = await api.get('/documents/stats', { params });
      
      if (response.data.success) {
        return {
          success: true,
          stats: response.data.data
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to load document statistics'
        };
      }
    } catch (error: any) {
      console.error('Get document stats error:', error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || 'Failed to load document statistics'
      };
    }
  }

  /**
   * Extract OCR text from document (DEPRECATED - Use explainDocument instead)
   */
  static async extractOCRText(documentId: string): Promise<AIExplanationResponse> {
    console.warn('⚠️ extractOCRText is deprecated. Use explainDocument instead.');
    try {
      const response = await api.post(`/documents/${documentId}/ocr`);
      return response.data;
    } catch (error: any) {
      console.error('OCR extraction error:', error);
      return {
        success: false,
        explanation: '',
        language: 'english',
        confidence: 0,
        wordCount: 0,
        characterCount: 0,
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

// Export standalone functions for convenience
export const uploadDocument = async (formData: FormData) => {
  try {
    console.log('🚀 Starting document upload');
    console.log('📍 Server URL:', API_BASE_URL);

    const uploadUrl = API_BASE_URL + '/documents/upload';
    console.log('🔗 Making API request to:', uploadUrl);
    
    const response = await api.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        'Accept': 'application/json',
      },
      timeout: 60000 // 60 seconds
    });

    console.log('✅ API response received:', response.status, response.data);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message,
        document: {
          _id: response.data.data.documentId,
          fileName: response.data.data.filename,
          originalName: response.data.data.originalFilename,
          filePath: response.data.data.fileUrl || response.data.data.filepath,
          uploadDate: new Date(response.data.data.uploadedAt),
        }
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
    
    if (error.response) {
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
};

export const analyzeDocument = async (
  documentId: string, 
  options: { summaryLanguage: string; translationLanguage: string }
) => {
  try {
    console.log('🔍 Starting document analysis for:', documentId);
    console.log('📋 Options:', options);

    // For now, we'll use the /explain endpoint with the summary language
    // In the future, you might want to add a separate analysis endpoint that supports both languages
    const response = await api.post(`/documents/${documentId}/analyze`, {
      summaryLanguage: options.summaryLanguage,
      translationLanguage: options.translationLanguage
    });

    console.log('✅ Analysis response received:', response.status, response.data);

    if (response.data.success) {
      return {
        success: true,
        message: response.data.message || 'Analysis completed',
        analysis: {
          summary: response.data.data?.explanation || response.data.data?.summary,
          translation: response.data.data?.translation,
          extractedText: response.data.data?.extractedText
        }
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Analysis failed'
      };
    }
  } catch (error: any) {
    console.error('Document analysis error:', error);
    
    if (error.response) {
      console.error('Server response error:', error.response.data);
      return {
        success: false,
        message: error.response.data?.message || 'Analysis failed',
        error: error.response.statusText
      };
    }
    
    return {
      success: false,
      message: 'Analysis failed',
      error: error.message || 'Network error'
    };
  }
};

export default DocumentService;