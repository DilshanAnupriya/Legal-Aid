import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DocumentService } from '../services/documentService';
import { Document } from '../types/document';

interface DocumentHistoryProps {
  userId?: string;
  onDocumentPress?: (document: Document) => void;
}

export default function DocumentHistory({ userId, onDocumentPress }: DocumentHistoryProps) {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [stats, setStats] = useState<any>(null);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Load documents
  const loadDocuments = async (pageNum: number = 1, refresh: boolean = false) => {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const filters: any = {};
      if (userId) filters.userId = userId;
      if (filter !== 'all') filters.status = filter;

      const response = await DocumentService.getUploadHistory(pageNum, 20, filters);

      if (response.success) {
        if (refresh || pageNum === 1) {
          setDocuments(response.documents);
        } else {
          setDocuments(prev => [...prev, ...response.documents]);
        }
        
        setHasMore(response.documents.length === 20);
        setPage(pageNum);
      } else {
        Alert.alert('Error', response.error || 'Failed to load documents');
      }
    } catch (error: any) {
      console.error('Load documents error:', error);
      Alert.alert('Error', 'Failed to load documents');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Load statistics
  const loadStats = async () => {
    try {
      const response = await DocumentService.getDocumentStats(userId);
      if (response.success && response.stats) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Load stats error:', error);
    }
  };

  // Initial load
  useEffect(() => {
    loadDocuments(1);
    loadStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Refresh handler
  const handleRefresh = () => {
    loadDocuments(1, true);
    loadStats();
  };

  // Load more handler
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadDocuments(page + 1);
    }
  };

  // Format date
  const formatDate = (date: Date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

  // Get status icon and color
  const getStatusInfo = (status?: string) => {
    switch (status) {
      case 'completed':
        return { icon: 'checkmark-circle', color: '#4CAF50', label: 'Completed' };
      case 'processing':
        return { icon: 'hourglass', color: '#FF9800', label: 'Processing' };
      case 'failed':
        return { icon: 'close-circle', color: '#F44336', label: 'Failed' };
      default:
        return { icon: 'time', color: '#9E9E9E', label: 'Pending' };
    }
  };

  // Handle document press
  const handleDocumentPress = (document: Document) => {
    setSelectedDocument(document);
    setModalVisible(true);
    if (onDocumentPress) {
      onDocumentPress(document);
    }
  };

  // Close modal
  const closeModal = () => {
    setModalVisible(false);
    setTimeout(() => setSelectedDocument(null), 300);
  };

  // Render document item
  const renderDocumentItem = ({ item }: { item: Document }) => {
    const statusInfo = getStatusInfo(item.aiStatus);

    return (
      <TouchableOpacity
        style={styles.documentCard}
        onPress={() => handleDocumentPress(item)}
      >
        <View style={styles.documentHeader}>
          <Ionicons name="document-text" size={40} color="#007AFF" />
          <View style={styles.documentInfo}>
            <Text style={styles.documentName} numberOfLines={1}>
              {item.originalName}
            </Text>
            <Text style={styles.documentMeta}>
              {formatFileSize(item.fileSize)} • {formatDate(item.uploadDate)}
            </Text>
          </View>
        </View>

        <View style={styles.documentFooter}>
          <View style={styles.statusBadge}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {item.explanationLanguage && (
            <View style={styles.languageBadge}>
              <Ionicons name="language" size={14} color="#666" />
              <Text style={styles.languageText}>
                {item.explanationLanguage.charAt(0).toUpperCase() + item.explanationLanguage.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {item.aiExplanation && (
          <Text style={styles.explanationPreview} numberOfLines={2}>
            {item.aiExplanation}
          </Text>
        )}
      </TouchableOpacity>
    );
  };

  // Render filter buttons
  const renderFilters = () => (
    <View style={styles.filterContainer}>
      {['all', 'completed', 'pending', 'failed'].map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.filterButton, filter === f && styles.filterButtonActive]}
          onPress={() => setFilter(f as any)}
        >
          <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render stats
  const renderStats = () => {
    if (!stats) return null;

    return (
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#4CAF50' }]}>{stats.processed}</Text>
          <Text style={styles.statLabel}>Processed</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#FF9800' }]}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statValue, { color: '#F44336' }]}>{stats.failed}</Text>
          <Text style={styles.statLabel}>Failed</Text>
        </View>
      </View>
    );
  };

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>No Documents Found</Text>
      <Text style={styles.emptySubtitle}>
        {filter !== 'all' 
          ? `No ${filter} documents to display` 
          : 'Upload your first document to get started'}
      </Text>
    </View>
  );

  // Render footer loader
  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  // Render document detail modal
  const renderDocumentModal = () => {
    if (!selectedDocument) return null;
    
    const statusInfo = getStatusInfo(selectedDocument.aiStatus);

    return (
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="arrow-back" size={28} color="#007AFF" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Document Analysis</Text>
              <View style={styles.closeButton} />
            </View>

            {/* Modal Content - Similar to Results View */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
              <View style={styles.resultsCard}>
                {/* Success Header */}
                <View style={styles.resultsHeader}>
                  <Ionicons 
                    name={statusInfo.icon as any} 
                    size={48} 
                    color={statusInfo.color} 
                  />
                  <Text style={styles.resultsTitle}>{statusInfo.label}</Text>
                  <Text style={styles.resultsSubtitle}>
                    {selectedDocument.originalName}
                  </Text>
                  {selectedDocument.explanationLanguage && (
                    <Text style={styles.resultsLanguage}>
                      Analyzed in {selectedDocument.explanationLanguage.charAt(0).toUpperCase() + 
                       selectedDocument.explanationLanguage.slice(1)}
                    </Text>
                  )}
                </View>

                {/* AI Explanation Section */}
                {selectedDocument.aiExplanation ? (
                  <View style={styles.explanationSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="document-text-outline" size={24} color="#007AFF" />
                      <Text style={styles.sectionTitle}>AI Explanation</Text>
                    </View>
                    <Text style={styles.explanationText}>{selectedDocument.aiExplanation}</Text>
                  </View>
                ) : (
                  <View style={styles.noExplanationSection}>
                    <Ionicons name="information-circle-outline" size={48} color="#ccc" />
                    <Text style={styles.noExplanationTitle}>
                      {selectedDocument.aiStatus === 'failed' 
                        ? 'Analysis Failed' 
                        : selectedDocument.aiStatus === 'processing'
                        ? 'Processing...'
                        : 'Not Analyzed Yet'}
                    </Text>
                    <Text style={styles.noExplanationText}>
                      {selectedDocument.aiStatus === 'failed' 
                        ? 'The AI analysis failed for this document. Please try uploading again.' 
                        : selectedDocument.aiStatus === 'processing'
                        ? 'The document is currently being analyzed. Please check back in a moment.'
                        : 'This document has not been analyzed yet.'}
                    </Text>
                  </View>
                )}

                {/* Document Info Stats */}
                <View style={styles.statsContainer}>
                  <View style={styles.statBox}>
                    <Ionicons name="resize-outline" size={24} color="#FF9800" />
                    <Text style={styles.statValue}>{formatFileSize(selectedDocument.fileSize)}</Text>
                    <Text style={styles.statLabel}>File Size</Text>
                  </View>
                  
                  <View style={styles.statBox}>
                    <Ionicons name="calendar-outline" size={24} color="#2196F3" />
                    <Text style={styles.statValue}>
                      {new Date(selectedDocument.uploadDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                    <Text style={styles.statLabel}>Uploaded</Text>
                  </View>

                  <View style={styles.statBox}>
                    <Ionicons name={statusInfo.icon as any} size={24} color={statusInfo.color} />
                    <Text style={[styles.statValue, { fontSize: 16 }]}>{statusInfo.label}</Text>
                    <Text style={styles.statLabel}>Status</Text>
                  </View>
                </View>

                {/* Close Button */}
                <TouchableOpacity style={styles.newAnalysisButton} onPress={closeModal}>
                  <Ionicons name="close-circle-outline" size={24} color="#007AFF" />
                  <Text style={styles.newAnalysisText}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {renderStats()}
      {renderFilters()}
      
      {loading && !refreshing && documents.length === 0 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading documents...</Text>
        </View>
      ) : (
        <FlatList
          data={documents}
          renderItem={renderDocumentItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={['#007AFF']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmptyState}
        />
      )}
      
      {/* Document Detail Modal */}
      {renderDocumentModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#007AFF',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  filterTextActive: {
    color: '#fff',
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  documentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  documentInfo: {
    flex: 1,
    marginLeft: 12,
  },
  documentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
    color: '#999',
  },
  documentFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 8,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  languageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },
  languageText: {
    fontSize: 12,
    color: '#666',
  },
  explanationPreview: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
    marginTop: 8,
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: '#f5f5f5',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '95%',
    minHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
    width: 36,
  },
  modalContent: {
    flex: 1,
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    margin: 16,
  },
  resultsHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },
  resultsSubtitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
    textAlign: 'center',
  },
  resultsLanguage: {
    fontSize: 12,
    color: '#999',
    marginTop: 8,
  },
  explanationSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
    textAlign: 'justify',
  },
  noExplanationSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 24,
  },
  noExplanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#999',
    marginTop: 16,
  },
  noExplanationText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  statBox: {
    alignItems: 'center',
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    marginTop: 24,
  },
  newAnalysisText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
});
