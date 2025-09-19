import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface OCRResultWidgetProps {
  text: string;
  confidence?: number;
  isLoading?: boolean;
  onExtractText?: () => void;
  theme: string;
  colors: any;
}

const OCRResultWidget: React.FC<OCRResultWidgetProps> = ({
  text,
  confidence,
  isLoading = false,
  onExtractText,
  theme,
  colors,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleCopyText = async () => {
    try {
      // For now, just show an alert since clipboard package isn't available
      Alert.alert('Copy', 'Text would be copied to clipboard in a real implementation');
    } catch (error) {
      console.error('Copy error:', error);
      Alert.alert('Error', 'Failed to copy text');
    }
  };

  const handleShareText = async () => {
    try {
      await Share.share({
        message: text,
        title: 'Extracted Text',
      });
    } catch (error) {
      console.error('Share error:', error);
      Alert.alert('Error', 'Failed to share text');
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <Ionicons name="refresh" size={20} color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.darkgray }]}>
            Extracting text...
          </Text>
        </View>
      );
    }

    if (!text && onExtractText) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="scan-outline" size={32} color={colors.darkgray} />
          <Text style={[styles.emptyText, { color: colors.darkgray }]}>
            No text extracted yet
          </Text>
          <TouchableOpacity
            style={[styles.extractButton, { backgroundColor: colors.accent }]}
            onPress={onExtractText}
          >
            <Ionicons name="text-outline" size={16} color={colors.white} />
            <Text style={[styles.extractButtonText, { color: colors.white }]}>
              Extract Text
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (!text) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={32} color={colors.darkgray} />
          <Text style={[styles.emptyText, { color: colors.darkgray }]}>
            No text available
          </Text>
        </View>
      );
    }

    const displayText = isExpanded ? text : text.substring(0, 200) + (text.length > 200 ? '...' : '');

    return (
      <View style={styles.textContainer}>
        <ScrollView style={styles.textScrollView} nestedScrollEnabled>
          <Text style={[styles.extractedText, { color: colors.primary }]} selectable>
            {displayText}
          </Text>
        </ScrollView>
        
        {text.length > 200 && (
          <TouchableOpacity
            style={styles.expandButton}
            onPress={() => setIsExpanded(!isExpanded)}
          >
            <Text style={[styles.expandButtonText, { color: colors.accent }]}>
              {isExpanded ? 'Show Less' : 'Show More'}
            </Text>
            <Ionicons
              name={isExpanded ? 'chevron-up' : 'chevron-down'}
              size={16}
              color={colors.accent}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="text-outline" size={20} color={colors.primary} />
          <Text style={[styles.title, { color: colors.primary }]}>
            Extracted Text
          </Text>
          {confidence !== undefined && (
            <View style={[styles.confidenceBadge, { backgroundColor: colors.accent + '20' }]}>
              <Text style={[styles.confidenceText, { color: colors.accent }]}>
                {Math.round(confidence)}%
              </Text>
            </View>
          )}
        </View>

        {text && !isLoading && (
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.light }]}
              onPress={handleCopyText}
            >
              <Ionicons name="copy-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.actionButton, { backgroundColor: colors.light }]}
              onPress={handleShareText}
            >
              <Ionicons name="share-outline" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.content}>
        {renderContent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  confidenceBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  confidenceText: {
    fontSize: 10,
    fontWeight: '600',
  },
  actions: {
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
  content: {
    padding: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
    fontStyle: 'italic',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    fontSize: 14,
    marginVertical: 8,
    textAlign: 'center',
  },
  extractButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 8,
  },
  extractButtonText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  textContainer: {
    minHeight: 100,
  },
  textScrollView: {
    maxHeight: 200,
  },
  extractedText: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 12,
    fontWeight: '500',
    marginRight: 4,
  },
});

export default OCRResultWidget;