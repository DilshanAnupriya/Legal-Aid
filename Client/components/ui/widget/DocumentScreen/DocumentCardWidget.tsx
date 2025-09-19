import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '@/types/document';
import { 
  formatFileSize, 
  formatDate, 
  getFileTypeIcon, 
  getFileTypeColor,
  isImageFile 
} from '@/utils/documentUtils';

interface DocumentCardWidgetProps {
  document: Document;
  onPress: (document: Document) => void;
  onDelete?: (documentId: string) => void;
  showActions?: boolean;
  theme: string;
  colors: any;
}

const DocumentCardWidget: React.FC<DocumentCardWidgetProps> = ({
  document,
  onPress,
  onDelete,
  showActions = true,
  theme,
  colors,
}) => {
  const handlePress = () => {
    onPress(document);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(document._id);
    }
  };

  const renderThumbnail = () => {
    if (document.thumbnailPath || isImageFile(document.mimeType)) {
      return (
        <Image
          source={{ uri: document.thumbnailPath || document.filePath }}
          style={styles.thumbnail}
          resizeMode="cover"
        />
      );
    }

    return (
      <View style={[styles.iconContainer, { backgroundColor: getFileTypeColor(document.mimeType) + '20' }]}>
        <Ionicons
          name={getFileTypeIcon(document.mimeType) as any}
          size={24}
          color={getFileTypeColor(document.mimeType)}
        />
      </View>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: colors.white }]}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Thumbnail/Icon */}
        <View style={styles.thumbnailContainer}>
          {renderThumbnail()}
        </View>

        {/* Document Info */}
        <View style={styles.infoContainer}>
          <Text 
            style={[styles.fileName, { color: colors.primary }]}
            numberOfLines={2}
          >
            {document.originalName || document.fileName}
          </Text>
          
          <View style={styles.metaInfo}>
            <Text style={[styles.fileSize, { color: colors.darkgray }]}>
              {formatFileSize(document.fileSize)}
            </Text>
            <Text style={[styles.separator, { color: colors.darkgray }]}>
              •
            </Text>
            <Text style={[styles.uploadDate, { color: colors.darkgray }]}>
              {formatDate(document.uploadDate)}
            </Text>
          </View>

          {/* Category Tag */}
          {document.category && (
            <View style={[styles.categoryTag, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.categoryText, { color: colors.accent }]}>
                {document.category.toUpperCase()}
              </Text>
            </View>
          )}

          {/* OCR Status */}
          {document.isProcessed && (
            <View style={styles.statusContainer}>
              <Ionicons
                name="text-outline"
                size={12}
                color={colors.darkgray}
              />
              <Text style={[styles.statusText, { color: colors.darkgray }]}>
                Text extracted
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        {showActions && (
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.light }]}
              onPress={handlePress}
            >
              <Ionicons
                name="eye-outline"
                size={16}
                color={colors.primary}
              />
            </TouchableOpacity>
            
            {onDelete && (
              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: '#FF6B6B20' }]}
                onPress={handleDelete}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color="#FF6B6B"
                />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* Processing Indicator */}
      {!document.isProcessed && (
        <View style={[styles.processingIndicator, { backgroundColor: colors.accent }]}>
          <Text style={[styles.processingText, { color: colors.white }]}>
            Processing...
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 6,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  content: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
  },
  thumbnailContainer: {
    marginRight: 12,
  },
  thumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    flex: 1,
    marginRight: 8,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  metaInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  fileSize: {
    fontSize: 12,
    fontWeight: '500',
  },
  separator: {
    fontSize: 12,
    marginHorizontal: 6,
  },
  uploadDate: {
    fontSize: 12,
    fontWeight: '500',
  },
  categoryTag: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 4,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    marginLeft: 4,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  processingIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingVertical: 4,
    alignItems: 'center',
  },
  processingText: {
    fontSize: 10,
    fontWeight: '600',
  },
});

export default DocumentCardWidget;