import { 
  FileValidationResult, 
  FileValidationRules, 
  DEFAULT_FILE_VALIDATION,
  DocumentCategory 
} from '@/types/document';

/**
 * Validate file based on size and type restrictions
 */
export const validateFile = (
  file: any,
  rules: FileValidationRules = DEFAULT_FILE_VALIDATION
): FileValidationResult => {
  if (!file) {
    return { isValid: false, error: 'No file selected' };
  }

  // Check file size
  if (file.size > rules.maxSize) {
    const maxSizeMB = rules.maxSize / (1024 * 1024);
    return { 
      isValid: false, 
      error: `File size exceeds ${maxSizeMB}MB limit` 
    };
  }

  // Check file type
  if (!rules.allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `File type ${file.type} is not supported` 
    };
  }

  // Check file extension
  const fileName = file.name || file.fileName || '';
  const extension = getFileExtension(fileName);
  if (!rules.allowedExtensions.includes(extension.toLowerCase())) {
    return { 
      isValid: false, 
      error: `File extension ${extension} is not supported` 
    };
  }

  return { isValid: true };
};

/**
 * Get file extension from filename
 */
export const getFileExtension = (fileName: string): string => {
  const lastDot = fileName.lastIndexOf('.');
  return lastDot !== -1 ? fileName.substring(lastDot) : '';
};

/**
 * Format file size in human readable format
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Get file type icon name for display
 */
export const getFileTypeIcon = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'image-outline';
  } else if (mimeType === 'application/pdf') {
    return 'document-text-outline';
  } else if (mimeType.startsWith('text/')) {
    return 'document-outline';
  } else {
    return 'document-outline';
  }
};

/**
 * Get file type color for display
 */
export const getFileTypeColor = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return '#4CAF50'; // Green for images
  } else if (mimeType === 'application/pdf') {
    return '#F44336'; // Red for PDFs
  } else if (mimeType.startsWith('text/')) {
    return '#2196F3'; // Blue for text files
  } else {
    return '#757575'; // Gray for other files
  }
};

/**
 * Generate thumbnail placeholder based on file type
 */
export const getThumbnailPlaceholder = (mimeType: string): string => {
  if (mimeType.startsWith('image/')) {
    return 'image';
  } else if (mimeType === 'application/pdf') {
    return 'pdf';
  } else {
    return 'document';
  }
};

/**
 * Format date for display
 */
export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - d.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) {
    return 'Today';
  } else if (diffDays === 2) {
    return 'Yesterday';
  } else if (diffDays <= 7) {
    return `${diffDays - 1} days ago`;
  } else {
    return d.toLocaleDateString();
  }
};

/**
 * Create file object from URI (for React Native)
 */
export const createFileFromUri = (uri: string, fileName: string, type: string) => {
  return {
    uri,
    name: fileName,
    type,
  };
};

/**
 * Generate unique filename to avoid conflicts
 */
export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const extension = getFileExtension(originalName);
  const nameWithoutExt = originalName.replace(extension, '');
  
  return `${nameWithoutExt}-${timestamp}-${random}${extension}`;
};

/**
 * Get document category suggestions based on file name
 */
export const suggestDocumentCategory = (fileName: string): DocumentCategory => {
  const lowerName = fileName.toLowerCase();
  
  if (lowerName.includes('contract') || lowerName.includes('agreement')) {
    return DocumentCategory.CONTRACTS;
  } else if (lowerName.includes('id') || lowerName.includes('passport') || lowerName.includes('license')) {
    return DocumentCategory.IDENTIFICATION;
  } else if (lowerName.includes('bank') || lowerName.includes('financial') || lowerName.includes('statement')) {
    return DocumentCategory.FINANCIAL;
  } else if (lowerName.includes('legal') || lowerName.includes('court') || lowerName.includes('law')) {
    return DocumentCategory.LEGAL;
  } else {
    return DocumentCategory.OTHER;
  }
};

/**
 * Extract tags from filename
 */
export const extractTagsFromFileName = (fileName: string): string[] => {
  const tags: string[] = [];
  const lowerName = fileName.toLowerCase();
  
  // Common document keywords that can become tags
  const keywords = [
    'contract', 'agreement', 'legal', 'court', 'law', 'financial', 
    'bank', 'statement', 'id', 'passport', 'license', 'personal',
    'urgent', 'important', 'confidential', 'draft', 'final'
  ];
  
  keywords.forEach(keyword => {
    if (lowerName.includes(keyword)) {
      tags.push(keyword);
    }
  });
  
  return tags;
};

/**
 * Check if file is an image
 */
export const isImageFile = (mimeType: string): boolean => {
  return mimeType.startsWith('image/');
};

/**
 * Check if file is a PDF
 */
export const isPDFFile = (mimeType: string): boolean => {
  return mimeType === 'application/pdf';
};

/**
 * Get readable file type name
 */
export const getReadableFileType = (mimeType: string): string => {
  const typeMap: { [key: string]: string } = {
    'image/jpeg': 'JPEG Image',
    'image/jpg': 'JPG Image',
    'image/png': 'PNG Image',
    'application/pdf': 'PDF Document',
    'text/plain': 'Text File',
  };
  
  return typeMap[mimeType] || 'Unknown File Type';
};