import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Document } from '@/types/document';
import DocumentCardWidget from './DocumentCardWidget';

interface DocumentListWidgetProps {
  documents: Document[];
  loading?: boolean;
  refreshing?: boolean;
  hasMoreData?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  onDocumentPress: (document: Document) => void;
  onDocumentDelete?: (documentId: string) => void;
  theme: string;
  colors: any;
}

const DocumentListWidget: React.FC<DocumentListWidgetProps> = ({
  documents,
  loading = false,
  refreshing = false,
  hasMoreData = false,
  onRefresh,
  onLoadMore,
  onDocumentPress,
  onDocumentDelete,
  theme,
  colors,
}) => {
  const renderDocument = ({ item }: { item: Document }) => (
    <DocumentCardWidget
      document={item}
      onPress={onDocumentPress}
      onDelete={onDocumentDelete}
      theme={theme}
      colors={colors}
    />
  );

  const renderFooter = () => {
    if (!hasMoreData) return null;

    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.accent} />
        <Text style={[styles.loadingText, { color: colors.darkgray }]}>
          Loading more documents...
        </Text>
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.accent} />
          <Text style={[styles.loadingText, { color: colors.darkgray }]}>
            Loading documents...
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <View style={[styles.emptyIconContainer, { backgroundColor: colors.light }]}>
          <Ionicons
            name="document-outline"
            size={48}
            color={colors.darkgray}
          />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.primary }]}>
          No Documents Found
        </Text>
        <Text style={[styles.emptySubtitle, { color: colors.darkgray }]}>
          Upload your first document to get started
        </Text>
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.accent }]}
          onPress={() => {
            // This would trigger the upload action
            console.log('Upload button pressed from empty state');
          }}
        >
          <Ionicons name="add" size={20} color={colors.white} />
          <Text style={[styles.uploadButtonText, { color: colors.white }]}>
            Upload Document
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  const keyExtractor = (item: Document) => item._id;

  const handleEndReached = () => {
    if (!loading && hasMoreData && onLoadMore) {
      onLoadMore();
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.light }]}>
      <FlatList
        data={documents}
        renderItem={renderDocument}
        keyExtractor={keyExtractor}
        onEndReached={handleEndReached}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          onRefresh ? (
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.accent]}
              tintColor={colors.accent}
            />
          ) : undefined
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          documents.length === 0 ? styles.emptyListContainer : styles.listContainer
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContainer: {
    paddingVertical: 8,
    paddingBottom: 20,
  },
  emptyListContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerLoader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
  },
  loadingText: {
    fontSize: 14,
    marginLeft: 8,
    fontWeight: '500',
  },
});

export default DocumentListWidget;