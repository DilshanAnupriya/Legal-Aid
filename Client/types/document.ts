export interface Document {
  _id: string;
  fileName: string;
  originalName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  userId?: string;
  category?: DocumentCategory;
  tags?: string[];
  ocrText?: string;
  isProcessed: boolean;
  thumbnailPath?: string;
}

export interface DocumentUploadRequest {
  file: File | FormData;
  category?: DocumentCategory;
  tags?: string[];
}

export interface DocumentUploadResponse {
  success: boolean;
  message: string;
  document?: Document;
  error?: string;
}

export interface DocumentListResponse {
  success: boolean;
  documents: Document[];
  total: number;
  page: number;
  limit: number;
  error?: string;
}

export interface OCRResponse {
  success: boolean;
  text: string;
  confidence: number;
  error?: string;
}

export enum DocumentCategory {
  LEGAL = 'legal',
  PERSONAL = 'personal',
  CONTRACTS = 'contracts',
  IDENTIFICATION = 'identification',
  FINANCIAL = 'financial',
  OTHER = 'other'
}

export interface DocumentFilter {
  category?: DocumentCategory;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  tags?: string[];
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

export interface DocumentCardProps {
  document: Document;
  onPress: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  showActions?: boolean;
}

export interface DocumentUploadWidgetProps {
  onUploadStart: (file: any) => void;
  onUploadProgress: (progress: UploadProgress) => void;
  onUploadComplete: (document: Document) => void;
  onUploadError: (error: string) => void;
  isUploading?: boolean;
}

export interface DocumentSearchProps {
  onSearch: (query: string) => void;
  onFilterChange: (filter: DocumentFilter) => void;
  placeholder?: string;
}

export interface DocumentListProps {
  documents: Document[];
  loading?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onDocumentPress: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
}

export interface DocumentDetailModalProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
  onDelete?: (documentId: string) => void;
  onDownload?: (document: Document) => void;
}

// File validation types
export interface FileValidationResult {
  isValid: boolean;
  error?: string;
}

export interface FileValidationRules {
  maxSize: number; // in bytes
  allowedTypes: string[];
  allowedExtensions: string[];
}

export const DEFAULT_FILE_VALIDATION: FileValidationRules = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],
  allowedExtensions: ['.jpg', '.jpeg', '.png', '.pdf']
};