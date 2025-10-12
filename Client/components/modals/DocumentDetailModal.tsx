import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '@/types/document';
import { DocumentService } from '@/services/documentService';
import { 
  formatFileSize, 
  formatDate, 
  getFileTypeIcon, 
  getFileTypeColor,
  isImageFile,
  getReadableFileType
} from '@/utils/documentUtils';
import { useTheme } from '@/context/ThemeContext';

interface DocumentDetailModalProps {
  visible: boolean;
  document: Document | null;
  onClose: () => void;
  onDelete?: (documentId: string) => void;
}

const { width: screenWidth } = Dimensions.get('window');

const DocumentDetailModal: React.FC<DocumentDetailModalProps> = ({
  visible,
  document,
  onClose,
  onDelete,
}) => {
  const { theme, colors } = useTheme();
  const [ocrText, setOcrText] = useState<string>('');
  const [loadingOCR, setLoadingOCR] = useState(false);
  const [showOCRText, setShowOCRText] = useState(false);

  const extractOCRText = useCallback(async () => {
    if (!document) return;
    
    setLoadingOCR(true);
    try {
      const response = await DocumentService.extractOCRText(document._id);
      if (response.success) {
        setOcrText(response.text);
      } else {
        Alert.alert('OCR Error', response.error || 'Failed to extract text');
      }
    } catch (error) {
      console.error('OCR extraction error:', error);
      Alert.alert('Error', 'Failed to extract text from document');
    } finally {
      setLoadingOCR(false);
    }
  }, [document]);

  useEffect(() => {
    if (document && document.ocrText) {
      setOcrText(document.ocrText);
    } else if (document && isImageFile(document.mimeType)) {
      // Auto-extract OCR text for images
      extractOCRText();
    }
  }, [document, extractOCRText]);

  const handleDelete = () => {
    if (!document || !onDelete) return;

    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document? This action cannot be undone.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            onDelete(document._id);
            onClose();
          },
        },
      ]
    );
  };

  const handleShare = async () => {
    if (!document) return;

    try {
      await Share.share({
        message: `Document: ${document.originalName || document.fileName}`,
        title: 'Share Document',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share document');
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    try {
      // In a real app, this would download the file
      Alert.alert('Download', 'Download functionality would be implemented here');
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Error', 'Failed to download document');
    }
  };

  const renderPreview = () => {
    if (!document) return null;

    if (isImageFile(document.mimeType)) {
      return (
        <View style={styles.previewContainer}>
          <Image
            source={{ uri: document.filePath }}
            style={styles.imagePreview}
            resizeMode="contain"
          />
        </View>
      );
    }

    return (
      <View style={[styles.fileIconContainer, { backgroundColor: getFileTypeColor(document.mimeType) + '20' }]}>
        <Ionicons
          name={getFileTypeIcon(document.mimeType) as any}
          size={64}
          color={getFileTypeColor(document.mimeType)}
        />
        <Text style={[styles.fileTypeText, { color: colors.primary }]}>
          {getReadableFileType(document.mimeType)}
        </Text>
      </View>
    );
  };

  if (!document) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={[styles.container, { backgroundColor: colors.light }]}>
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.white, borderBottomColor: colors.light }]}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="close" size={24} color={colors.primary} />
          </TouchableOpacity>
          
          <Text style={[styles.headerTitle, { color: colors.primary }]} numberOfLines={1}>
            Document Details
          </Text>
          
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleShare} style={styles.headerAction}>
              <Ionicons name="share-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity onPress={handleDownload} style={styles.headerAction}>
              <Ionicons name="download-outline" size={24} color={colors.primary} />
            </TouchableOpacity>
            
            {onDelete && (
              <TouchableOpacity onPress={handleDelete} style={styles.headerAction}>
                <Ionicons name="trash-outline" size={24} color="#FF6B6B" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Document Preview */}
          {renderPreview()}

          {/* Document Information */}
          <View style={[styles.infoCard, { backgroundColor: colors.white }]}>
            <Text style={[styles.fileName, { color: colors.primary }]}>
              {document.originalName || document.fileName}
            </Text>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.darkgray }]}>Size</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  {formatFileSize(document.fileSize)}
                </Text>
              </View>
              
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.darkgray }]}>Type</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  {getReadableFileType(document.mimeType)}
                </Text>
              </View>
            </View>
            
            <View style={styles.infoRow}>
              <View style={styles.infoItem}>
                <Text style={[styles.infoLabel, { color: colors.darkgray }]}>Uploaded</Text>
                <Text style={[styles.infoValue, { color: colors.primary }]}>
                  {formatDate(document.uploadDate)}
                </Text>
              </View>
              
              {document.category && (
                <View style={styles.infoItem}>
                  <Text style={[styles.infoLabel, { color: colors.darkgray }]}>Category</Text>
                  <View style={[styles.categoryBadge, { backgroundColor: colors.accent + '20' }]}>
                    <Text style={[styles.categoryText, { color: colors.accent }]}>
                      {document.category.toUpperCase()}
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <View style={styles.tagsContainer}>
                <Text style={[styles.infoLabel, { color: colors.darkgray }]}>Tags</Text>
                <View style={styles.tagsWrapper}>
                  {document.tags.map((tag, index) => (
                    <View key={index} style={[styles.tag, { backgroundColor: colors.light }]}>
                      <Text style={[styles.tagText, { color: colors.primary }]}>
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* OCR Text Section */}
          {isImageFile(document.mimeType) && (
            <View style={[styles.ocrCard, { backgroundColor: colors.white }]}>
              <View style={styles.ocrHeader}>
                <View style={styles.ocrTitleContainer}>
                  <Ionicons name="text-outline" size={20} color={colors.primary} />
                  <Text style={[styles.ocrTitle, { color: colors.primary }]}>
                    Extracted Text
                  </Text>
                </View>
                
                {!ocrText && !loadingOCR && (
                  <TouchableOpacity
                    style={[styles.extractButton, { backgroundColor: colors.accent }]}
                    onPress={extractOCRText}
                  >
                    <Text style={[styles.extractButtonText, { color: colors.white }]}>
                      Extract Text
                    </Text>
                  </TouchableOpacity>
                )}
              </View>

              {loadingOCR && (
                <View style={styles.ocrLoading}>
                  <Text style={[styles.ocrLoadingText, { color: colors.darkgray }]}>
                    Extracting text from document...
                  </Text>
                </View>
              )}

              {ocrText && (
                <View style={styles.ocrContent}>
                  <TouchableOpacity
                    style={styles.ocrToggle}
                    onPress={() => setShowOCRText(!showOCRText)}
                  >
                    <Text style={[styles.ocrToggleText, { color: colors.accent }]}>
                      {showOCRText ? 'Hide Text' : 'Show Extracted Text'}
                    </Text>
                    <Ionicons
                      name={showOCRText ? 'chevron-up' : 'chevron-down'}
                      size={16}
                      color={colors.accent}
                    />
                  </TouchableOpacity>
                  
                  {showOCRText && (
                    <View style={[styles.ocrTextContainer, { backgroundColor: colors.light }]}>
                      <Text style={[styles.ocrText, { color: colors.primary }]} selectable>
                        {ocrText}
                      </Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    paddingTop: 60, // Account for status bar
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  closeButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerAction: {
    padding: 8,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  previewContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  imagePreview: {
    width: screenWidth - 32,
    height: 200,
    borderRadius: 12,
  },
  fileIconContainer: {
    marginVertical: 16,
    alignItems: 'center',
    paddingVertical: 40,
    borderRadius: 12,
  },
  fileTypeText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 12,
  },
  infoCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoItem: {
    flex: 1,
    marginRight: 16,
  },
  infoLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  tagsContainer: {
    marginTop: 8,
  },
  tagsWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  ocrCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  ocrHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  ocrTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ocrTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  extractButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  extractButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
  ocrLoading: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  ocrLoadingText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
  ocrContent: {
    marginTop: 8,
  },
  ocrToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  ocrToggleText: {
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  ocrTextContainer: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
    maxHeight: 200,
  },
  ocrText: {
    fontSize: 14,
    lineHeight: 20,
  },
});

export default DocumentDetailModal;