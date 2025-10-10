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
import { applyUnicodeStyle, detectLanguage } from '../utils/unicodeUtils';
import { useTheme } from '../context/ThemeContext';

interface DocumentHistoryProps {
  userId?: string;
  onDocumentPress?: (document: Document) => void;
}

export default function DocumentHistory({ userId, onDocumentPress }: DocumentHistoryProps) {
  const { theme, colors } = useTheme();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Format AI explanation for better readability
  const formatExplanation = (explanation: string) => {
    // Split by periods to create sentences
    const sentences = explanation.split('.').filter(sentence => sentence.trim().length > 0);
    
    // Group sentences into paragraphs (every 2-3 sentences)
    const paragraphs = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const paragraph = sentences.slice(i, i + 2).join('. ') + '.';
      paragraphs.push(paragraph.trim());
    }
    
    return paragraphs;
  };

  // Extract key points from explanation
  const extractKeyPoints = (explanation: string) => {
    const keyWords = ['important', 'key', 'main', 'primary', 'essential', 'significant', 'critical', 'must', 'should', 'required'];
    const sentences = explanation.split('.').filter(sentence => sentence.trim().length > 0);
    
    return sentences.filter(sentence => 
      keyWords.some(keyword => sentence.toLowerCase().includes(keyword))
    ).slice(0, 3); // Limit to top 3 key points
  };

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

  // Initial load
  useEffect(() => {
    loadDocuments(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // Refresh handler
  const handleRefresh = () => {
    loadDocuments(1, true);
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
        style={[styles.documentCard, { backgroundColor: colors.white, borderLeftColor: colors.primary }]}
        onPress={() => handleDocumentPress(item)}
      >
        <View style={styles.documentHeader}>
          <Ionicons name="document-text" size={40} color={colors.primary} />
          <View style={styles.documentInfo}>
            <Text style={[styles.documentName, { color: colors.primary }]} numberOfLines={1}>
              {item.originalName}
            </Text>
            <Text style={[styles.documentMeta, { color: colors.darkgray }]}>
              {formatFileSize(item.fileSize)} • {formatDate(item.uploadDate)}
            </Text>
          </View>
        </View>

        <View style={styles.documentFooter}>
          <View style={[styles.statusBadge, { backgroundColor: colors.light }]}>
            <Ionicons name={statusInfo.icon as any} size={16} color={statusInfo.color} />
            <Text style={[styles.statusText, { color: statusInfo.color }]}>
              {statusInfo.label}
            </Text>
          </View>

          {item.explanationLanguage && (
            <View style={[styles.languageBadge, { backgroundColor: colors.light }]}>
              <Ionicons name="language" size={14} color={colors.darkgray} />
              <Text style={[styles.languageText, { color: colors.darkgray }]}>
                {item.explanationLanguage.charAt(0).toUpperCase() + item.explanationLanguage.slice(1)}
              </Text>
            </View>
          )}
        </View>

        {item.aiExplanation && (
          <View style={[styles.previewContainer, { backgroundColor: colors.light }]}>
            <Text 
              style={[
                applyUnicodeStyle(styles.explanationPreview, item.aiExplanation, item.explanationLanguage),
                { color: colors.darkgray }
              ]}
              numberOfLines={3}
            >
              <Ionicons name="bulb-outline" size={14} color={colors.accent} /> {item.aiExplanation}
            </Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  // Render filter buttons
  const renderFilters = () => (
    <View style={[styles.filterContainer, { backgroundColor: colors.white, borderBottomColor: colors.light }]}>
      {['all', 'completed', 'pending', 'failed'].map((f) => (
        <TouchableOpacity
          key={f}
          style={[styles.filterButton, filter === f && [styles.filterButtonActive, { backgroundColor: colors.primary }], { backgroundColor: filter === f ? colors.primary : colors.light }]}
          onPress={() => setFilter(f as any)}
        >
          <Text style={[styles.filterText, filter === f && [styles.filterTextActive, { color: colors.white }], { color: filter === f ? colors.white : colors.darkgray }]}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  // Render empty state
  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="folder-open-outline" size={80} color={colors.darkgray} />
      <Text style={[styles.emptyTitle, { color: colors.primary }]}>No Documents Found</Text>
      <Text style={[styles.emptySubtitle, { color: colors.darkgray }]}>
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
        <ActivityIndicator size="small" color={colors.primary} />
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
          <View style={[styles.modalContainer, { backgroundColor: colors.light }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { backgroundColor: colors.white }]}>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Ionicons name="arrow-back" size={28} color={colors.primary} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { color: colors.primary }]}>Document Analysis</Text>
              <View style={styles.closeButton} />
            </View>

            {/* Modal Content - Similar to Results View */}
            <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={true}>
              <View style={[styles.resultsCard, { backgroundColor: colors.white }]}>
                {/* Success Header */}
                <View style={[styles.resultsHeader, { borderBottomColor: colors.light }]}>
                  <Ionicons 
                    name={statusInfo.icon as any} 
                    size={48} 
                    color={statusInfo.color} 
                  />
                  <Text style={[styles.resultsTitle, { color: colors.primary }]}>{statusInfo.label}</Text>
                  <Text style={[styles.resultsSubtitle, { color: colors.darkgray }]}>
                    {selectedDocument.originalName}
                  </Text>
                  {selectedDocument.explanationLanguage && (
                    <Text style={[styles.resultsLanguage, { color: colors.darkgray }]}>
                      Analyzed in {selectedDocument.explanationLanguage.charAt(0).toUpperCase() + 
                       selectedDocument.explanationLanguage.slice(1)}
                    </Text>
                  )}
                </View>

                {/* AI Explanation Section */}
                {selectedDocument.aiExplanation ? (
                  <View style={styles.explanationSection}>
                    <View style={styles.sectionHeader}>
                      <Ionicons name="document-text-outline" size={24} color={colors.primary} />
                      <Text style={[styles.sectionTitle, { color: colors.primary }]}>AI Analysis Summary</Text>
                    </View>
                    
                    {/* Key Points Section */}
                    {extractKeyPoints(selectedDocument.aiExplanation).length > 0 && (
                      <View style={[styles.keyPointsContainer, { backgroundColor: colors.accent + '10', borderLeftColor: colors.accent }]}>
                        <View style={styles.keyPointsHeader}>
                          <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                          <Text style={[styles.keyPointsTitle, { color: colors.accent }]}>Key Points</Text>
                        </View>
                        {extractKeyPoints(selectedDocument.aiExplanation).map((point, index) => (
                          <View key={index} style={styles.keyPointItem}>
                            <Ionicons name="checkmark-circle" size={16} color={colors.accent} />
                            <Text style={[styles.keyPointText, { color: colors.primary }]}>
                              {point.trim()}.
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                    
                    {/* Detailed Explanation */}
                    <View style={[styles.detailedExplanation, { backgroundColor: colors.primary + '10', borderLeftColor: colors.primary, borderLeftWidth: 4 }]}>
                      <View style={styles.explanationHeader}>
                        <Ionicons name="library-outline" size={20} color={colors.primary} />
                        <Text style={[styles.explanationHeaderText, { color: colors.primary }]}>Detailed Analysis</Text>
                        <TouchableOpacity 
                          style={[styles.readAloudButton, { backgroundColor: colors.accent + '15', borderColor: colors.accent }]}
                          onPress={() => {/* Add TTS functionality */}}
                        >
                          <Ionicons name="volume-high-outline" size={16} color={colors.accent} />
                          <Text style={[styles.readAloudText, { color: colors.accent }]}>Listen</Text>
                        </TouchableOpacity>
                      </View>
                      
                      {formatExplanation(selectedDocument.aiExplanation).map((paragraph, index) => (
                        <View key={index} style={styles.paragraphContainer}>
                          <Text 
                            style={[
                              applyUnicodeStyle(styles.explanationText, paragraph, selectedDocument.explanationLanguage),
                              { color: colors.primary }
                            ]}
                          >
                            {paragraph}
                          </Text>
                        </View>
                      ))}
                    </View>
                  </View>
                ) : (
                  <View style={styles.noExplanationSection}>
                    <Ionicons name="information-circle-outline" size={48} color={colors.darkgray} />
                    <Text style={[styles.noExplanationTitle, { color: colors.darkgray }]}>
                      {selectedDocument.aiStatus === 'failed' 
                        ? 'Analysis Failed' 
                        : selectedDocument.aiStatus === 'processing'
                        ? 'Processing...'
                        : 'Not Analyzed Yet'}
                    </Text>
                    <Text style={[styles.noExplanationText, { color: colors.darkgray }]}>
                      {selectedDocument.aiStatus === 'failed' 
                        ? 'The AI analysis failed for this document. Please try uploading again.' 
                        : selectedDocument.aiStatus === 'processing'
                        ? 'The document is currently being analyzed. Please check back in a moment.'
                        : 'This document has not been analyzed yet.'}
                    </Text>
                  </View>
                )}

                {/* Close Button */}
                <TouchableOpacity style={[styles.newAnalysisButton, { borderColor: colors.primary }]} onPress={closeModal}>
                  <Ionicons name="close-circle-outline" size={24} color={colors.primary} />
                  <Text style={[styles.newAnalysisText, { color: colors.primary }]}>Close</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.light }]}>
      {renderFilters()}
      
      {loading && !refreshing && documents.length === 0 ? (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={[styles.loadingText, { color: colors.darkgray }]}>Loading documents...</Text>
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
              colors={[colors.primary]}
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
  },
  filterContainer: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  filterButtonActive: {
    // backgroundColor will be set dynamically
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
  },
  filterTextActive: {
    // color will be set dynamically
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  documentCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderLeftWidth: 4,
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
    marginBottom: 4,
  },
  documentMeta: {
    fontSize: 12,
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
  },
  languageText: {
    fontSize: 12,
  },
  explanationPreview: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
    color: '#666', // Default color, will be overridden by theme
  },
  previewContainer: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#e67e22',
  },
  centerLoader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
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
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
    width: 36,
  },
  modalContent: {
    flex: 1,
  },
  resultsCard: {
    borderRadius: 12,
    padding: 20,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultsHeader: {
    alignItems: 'center',
    paddingVertical: 20,
    borderBottomWidth: 1,
    marginBottom: 20,
  },
  resultsTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 12,
  },
  resultsSubtitle: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  resultsLanguage: {
    fontSize: 12,
    marginTop: 8,
  },
  explanationSection: {
    marginBottom: 24,
  },
  keyPointsContainer: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
  },
  keyPointsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  keyPointsTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  keyPointItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
    paddingLeft: 4,
  },
  keyPointText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
  },
  detailedExplanation: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  explanationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 8,
    justifyContent: 'space-between',
  },
  explanationHeaderText: {
    fontSize: 16,
    fontWeight: '600',
  },
  paragraphContainer: {
    marginBottom: 16,
    paddingLeft: 8,
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
  },
  explanationText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'justify',
    color: '#333', // Default color, will be overridden by theme
  },
  noExplanationSection: {
    alignItems: 'center',
    paddingVertical: 40,
    marginBottom: 24,
  },
  noExplanationTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 16,
  },
  noExplanationText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 20,
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
    marginTop: 24,
  },
  newAnalysisText: {
    fontSize: 16,
    fontWeight: '600',
  },
  readAloudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  readAloudText: {
    fontSize: 12,
    fontWeight: '500',
  },
});
