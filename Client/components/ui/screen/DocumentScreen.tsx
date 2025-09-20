import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { 
  Document, 
  DocumentFilter, 
  DocumentCategory,
  UploadProgress 
} from '@/types/document';
import { DocumentService } from '@/services/documentService';
import DocumentHeaderWidget from '@/components/ui/widget/DocumentScreen/DocumentHeaderWidget';
import DocumentSearchBarWidget from '@/components/ui/widget/DocumentScreen/DocumentSearchBarWidget';
import DocumentUploadWidget from '@/components/ui/widget/DocumentScreen/DocumentUploadWidget';
import DocumentListWidget from '@/components/ui/widget/DocumentScreen/DocumentListWidget';
import LoadingOverlayWidget from '@/components/ui/widget/DocumentScreen/LoadingOverlayWidget';
import DocumentDetailModal from '@/components/modals/DocumentDetailModal';

const DocumentScreen: React.FC = () => {
  const { colors, theme } = useTheme();
  
  // State management
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<DocumentFilter>({});
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUploadWidget, setShowUploadWidget] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMoreData, setHasMoreData] = useState(true);

  // Load documents
  const loadDocuments = useCallback(async (
    pageNum: number = 1, 
    resetList: boolean = true
  ) => {
    try {
      if (resetList) {
        setLoading(true);
      }

      const response = await DocumentService.getDocuments(pageNum, 20, filter);
      
      if (response.success) {
        if (resetList) {
          setDocuments(response.documents);
        } else {
          setDocuments(prev => [...prev, ...response.documents]);
        }
        setHasMoreData(response.documents.length === 20);
        setPage(pageNum);
      } else {
        Alert.alert('Error', response.error || 'Failed to load documents');
      }
    } catch (error) {
      console.error('Load documents error:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filter]);

  // Search documents
  const searchDocuments = useCallback(async (query: string) => {
    if (!query.trim()) {
      loadDocuments(1, true);
      return;
    }

    try {
      setLoading(true);
      const response = await DocumentService.searchDocuments(query);
      
      if (response.success) {
        setDocuments(response.documents);
      } else {
        Alert.alert('Error', response.error || 'Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Search failed');
    } finally {
      setLoading(false);
    }
  }, [loadDocuments]);

  // Handle upload start
  const handleUploadStart = useCallback((file: any) => {
    setUploading(true);
    setUploadProgress({ loaded: 0, total: file.size || 1, percentage: 0 });
    console.log('Upload started:', file.name);
  }, []);

  // Handle upload progress
  const handleUploadProgress = useCallback((progress: UploadProgress) => {
    setUploadProgress(progress);
  }, []);

  // Handle upload complete
  const handleUploadComplete = useCallback((document: Document) => {
    setUploading(false);
    setUploadProgress(null);
    setShowUploadWidget(false);
    
    // Add new document to the top of the list
    setDocuments(prev => [document, ...prev]);
    
    Alert.alert('Success', 'Document uploaded successfully!');
  }, []);

  // Handle upload error
  const handleUploadError = useCallback((error: string) => {
    setUploading(false);
    setUploadProgress(null);
    Alert.alert('Upload Failed', error);
  }, []);

  // Handle document press
  const handleDocumentPress = useCallback((document: Document) => {
    setSelectedDocument(document);
    setShowDetailModal(true);
  }, []);

  // Handle document delete
  const handleDocumentDelete = useCallback(async (documentId: string) => {
    try {
      const response = await DocumentService.deleteDocument(documentId);
      
      if (response.success) {
        setDocuments(prev => prev.filter(doc => doc._id !== documentId));
        Alert.alert('Success', 'Document deleted successfully');
        
        // Close modal if the deleted document was being viewed
        if (selectedDocument?._id === documentId) {
          setShowDetailModal(false);
          setSelectedDocument(null);
        }
      } else {
        Alert.alert('Error', response.message || 'Failed to delete document');
      }
    } catch (error) {
      console.error('Delete error:', error);
      Alert.alert('Error', 'Failed to delete document');
    }
  }, [selectedDocument]);

  // Handle search
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    searchDocuments(query);
  }, [searchDocuments]);

  // Handle filter change
  const handleFilterChange = useCallback((newFilter: DocumentFilter) => {
    setFilter(newFilter);
    setPage(1);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    setPage(1);
    loadDocuments(1, true);
  }, [loadDocuments]);

  // Handle load more
  const handleLoadMore = useCallback(() => {
    if (!loading && hasMoreData) {
      loadDocuments(page + 1, false);
    }
  }, [loading, hasMoreData, page, loadDocuments]);

  // Initial load
  useEffect(() => {
    loadDocuments(1, true);
  }, []);

  // Update documents when filter changes
  useEffect(() => {
    loadDocuments(1, true);
  }, [filter]);

  return (
    <View style={[styles.container, { backgroundColor: colors.light }]}>
      {/* Header */}
      <DocumentHeaderWidget
        documentsCount={documents.length}
        onUploadPress={() => setShowUploadWidget(true)}
        theme={theme}
        colors={colors}
      />

      {/* Search and Filter */}
      <DocumentSearchBarWidget
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        placeholder="Search documents..."
        theme={theme}
        colors={colors}
      />

      {/* Upload Widget */}
      {showUploadWidget && (
        <DocumentUploadWidget
          onUploadStart={handleUploadStart}
          onUploadProgress={handleUploadProgress}
          onUploadComplete={handleUploadComplete}
          onUploadError={handleUploadError}
          isUploading={uploading}
          uploadProgress={uploadProgress}
          onClose={() => setShowUploadWidget(false)}
          theme={theme}
          colors={colors}
        />
      )}

      {/* Documents List */}
      <DocumentListWidget
        documents={documents}
        loading={loading}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        onDocumentPress={handleDocumentPress}
        onDocumentDelete={handleDocumentDelete}
        refreshing={refreshing}
        hasMoreData={hasMoreData}
        theme={theme}
        colors={colors}
      />

      {/* Document Detail Modal */}
      <DocumentDetailModal
        visible={showDetailModal}
        document={selectedDocument}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedDocument(null);
        }}
        onDelete={handleDocumentDelete}
        theme={theme}
        colors={colors}
      />

      {/* Loading Overlay for uploads */}
      {uploading && (
        <LoadingOverlayWidget
          visible={uploading}
          message="Uploading document..."
          progress={uploadProgress?.percentage}
          theme={theme}
          colors={colors}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default DocumentScreen;