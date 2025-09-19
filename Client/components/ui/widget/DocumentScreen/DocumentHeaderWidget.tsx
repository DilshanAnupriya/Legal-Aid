import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DocumentHeaderWidgetProps {
  documentsCount: number;
  onUploadPress: () => void;
  theme: string;
  colors: any;
}

const DocumentHeaderWidget: React.FC<DocumentHeaderWidgetProps> = ({
  documentsCount,
  onUploadPress,
  theme,
  colors,
}) => {
  return (
    <View style={[styles.container, { backgroundColor: colors.white }]}>
      <View style={styles.headerContent}>
        <View style={styles.titleSection}>
          <Text style={[styles.title, { color: colors.primary }]}>
            My Documents
          </Text>
          <Text style={[styles.subtitle, { color: colors.darkgray }]}>
            {documentsCount} {documentsCount === 1 ? 'document' : 'documents'}
          </Text>
        </View>
        
        <TouchableOpacity
          style={[styles.uploadButton, { backgroundColor: colors.accent }]}
          onPress={onUploadPress}
          activeOpacity={0.8}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={colors.white} 
          />
          <Text style={[styles.uploadButtonText, { color: colors.white }]}>
            Upload
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
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
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default DocumentHeaderWidget;