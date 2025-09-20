import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { UploadProgress } from '@/types/document';
import { validateFile } from '@/utils/documentUtils';
import { DocumentService } from '@/services/documentService';

interface DocumentUploadWidgetProps {
  onUploadStart: (file: any) => void;
  onUploadProgress: (progress: UploadProgress) => void;
  onUploadComplete: (document: any) => void;
  onUploadError: (error: string) => void;
  onClose: () => void;
  isUploading?: boolean;
  uploadProgress?: UploadProgress | null;
  theme: string;
  colors: any;
}

const DocumentUploadWidget: React.FC<DocumentUploadWidgetProps> = ({
  onUploadStart,
  onUploadProgress,
  onUploadComplete,
  onUploadError,
  onClose,
  isUploading = false,
  uploadProgress,
  theme,
  colors,
}) => {
  const [selectedFile, setSelectedFile] = useState<any>(null);

  // Real file picker implementation
  const pickDocument = async () => {
    try {
      console.log('pickDocument called - opening file picker directly');
      
      // For web platform or any platform, go directly to file picker
      console.log('Starting file picker...');
      await pickFromFiles();
      
    } catch (error) {
      console.error('Document picker error:', error);
      onUploadError('Failed to pick document');
    }
  };

  const pickFromCamera = async () => {
    try {
      console.log('Requesting camera permissions...');
      // Request camera permissions
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      console.log('Camera permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to allow camera access to take photos.');
        return;
      }

      console.log('Launching camera...');
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Camera result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          name: asset.fileName || 'camera-document-' + Date.now() + '.jpg',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          uri: asset.uri
        };
        console.log('Camera file created:', file);
        handleFileSelected(file);
      } else {
        console.log('Camera selection was cancelled or failed');
      }
    } catch (error: any) {
      console.error('Camera picker error:', error);
      Alert.alert('Error', 'Failed to capture image: ' + (error?.message || 'Unknown error'));
      onUploadError('Failed to capture image');
    }
  };

  const pickFromGallery = async () => {
    try {
      console.log('Requesting media library permissions...');
      // Request media library permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      console.log('Media library permission result:', permissionResult);
      
      if (permissionResult.granted === false) {
        Alert.alert('Permission Required', 'You need to allow photo library access to select images.');
        return;
      }

      console.log('Launching image library...');
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      console.log('Gallery result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          name: asset.fileName || 'gallery-document-' + Date.now() + '.jpg',
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          uri: asset.uri
        };
        console.log('Gallery file created:', file);
        handleFileSelected(file);
      } else {
        console.log('Gallery selection was cancelled or failed');
      }
    } catch (error: any) {
      console.error('Gallery picker error:', error);
      Alert.alert('Error', 'Failed to pick from gallery: ' + (error?.message || 'Unknown error'));
      onUploadError('Failed to pick from gallery');
    }
  };

  const pickFromFiles = async () => {
    try {
      console.log('Launching document picker...');
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      console.log('Document picker result:', result);

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        const file = {
          name: asset.name,
          type: asset.mimeType || 'application/octet-stream',
          size: asset.size || 0,
          uri: asset.uri
        };
        console.log('File picker file created:', file);
        handleFileSelected(file);
      } else {
        console.log('File selection was cancelled or failed');
      }
    } catch (error: any) {
      console.error('File picker error:', error);
      Alert.alert('Error', 'Failed to pick file: ' + (error?.message || 'Unknown error'));
      onUploadError('Failed to pick file');
    }
  };

  const handleFileSelected = (file: any) => {
    // Validate file
    const validation = validateFile(file);
    if (!validation.isValid) {
      Alert.alert('Invalid File', validation.error);
      return;
    }

    setSelectedFile(file);
  };

  const uploadFile = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'Please select a file first');
      return;
    }

    try {
      onUploadStart(selectedFile);
      
      const response = await DocumentService.uploadDocument(
        selectedFile,
        onUploadProgress
      );
      
      if (response.success && response.document) {
        onUploadComplete(response.document);
        setSelectedFile(null);
      } else {
        onUploadError(response.error || 'Upload failed');
      }
    } catch (error: any) {
      console.error('Upload error:', error);
      onUploadError(error.message || 'Upload failed');
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
  };

  return (
    <Modal
      visible={true}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: colors.white }]}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.primary }]}>
              Upload Document
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Content */}
          <View style={styles.content}>
            {!selectedFile ? (
              // File picker section
              <View style={styles.pickerSection}>
                <TouchableOpacity 
                  style={[styles.uploadArea, { borderColor: colors.darkgray }]}
                  onPress={() => {
                    console.log('Upload area tapped');
                    if (!isUploading) {
                      pickDocument();
                    }
                  }}
                  activeOpacity={0.7}
                  disabled={isUploading}
                >
                  <Ionicons 
                    name="cloud-upload-outline" 
                    size={48} 
                    color={colors.darkgray} 
                  />
                  <Text style={[styles.uploadText, { color: colors.primary }]}>
                    Tap to select a document
                  </Text>
                  <Text style={[styles.uploadSubtext, { color: colors.darkgray }]}>
                    Images and PDFs up to 5MB
                  </Text>
                </TouchableOpacity>

                {/* Individual buttons for web compatibility */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[styles.sourceButton, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      console.log('Files button pressed');
                      if (!isUploading) pickFromFiles();
                    }}
                    disabled={isUploading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="folder-open-outline" size={20} color={colors.white} />
                    <Text style={[styles.sourceButtonText, { color: colors.white }]}>
                      Files
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.sourceButton, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      console.log('Gallery button pressed');
                      if (!isUploading) pickFromGallery();
                    }}
                    disabled={isUploading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="images-outline" size={20} color={colors.white} />
                    <Text style={[styles.sourceButtonText, { color: colors.white }]}>
                      Gallery
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.sourceButton, { backgroundColor: colors.accent }]}
                    onPress={() => {
                      console.log('Camera button pressed');
                      if (!isUploading) pickFromCamera();
                    }}
                    disabled={isUploading}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="camera-outline" size={20} color={colors.white} />
                    <Text style={[styles.sourceButtonText, { color: colors.white }]}>
                      Camera
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // File preview and upload section
              <View style={styles.previewSection}>
                <View style={[styles.filePreview, { backgroundColor: colors.light }]}>
                  <View style={styles.fileIcon}>
                    <Ionicons
                      name={selectedFile.type.startsWith('image/') ? 'image' : 'document-text'}
                      size={32}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={[styles.fileName, { color: colors.primary }]} numberOfLines={2}>
                      {selectedFile.name}
                    </Text>
                    <Text style={[styles.fileSize, { color: colors.darkgray }]}>
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </Text>
                  </View>
                  <TouchableOpacity onPress={clearSelection} style={styles.removeButton}>
                    <Ionicons name="close-circle" size={24} color={colors.darkgray} />
                  </TouchableOpacity>
                </View>

                {/* Upload Progress */}
                {isUploading && uploadProgress && (
                  <View style={styles.progressSection}>
                    <View style={styles.progressHeader}>
                      <Text style={[styles.progressText, { color: colors.primary }]}>
                        Uploading... {uploadProgress.percentage}%
                      </Text>
                    </View>
                    <View style={[styles.progressBar, { backgroundColor: colors.darkgray + '30' }]}>
                      <View
                        style={[
                          styles.progressFill,
                          {
                            backgroundColor: colors.accent,
                            width: `${uploadProgress.percentage}%`,
                          },
                        ]}
                      />
                    </View>
                  </View>
                )}

                {/* Upload Button */}
                {!isUploading && (
                  <TouchableOpacity
                    style={[styles.uploadButton, { backgroundColor: colors.accent }]}
                    onPress={uploadFile}
                  >
                    <Ionicons name="cloud-upload" size={20} color={colors.white} />
                    <Text style={[styles.uploadButtonText, { color: colors.white }]}>
                      Upload Document
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F7',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  content: {
    padding: 20,
  },
  pickerSection: {
    alignItems: 'center',
  },
  uploadArea: {
    width: '100%',
    height: 120,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  uploadText: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    marginTop: 4,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  selectButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  previewSection: {
    width: '100%',
  },
  filePreview: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  fileIcon: {
    marginRight: 12,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  fileSize: {
    fontSize: 14,
  },
  removeButton: {
    marginLeft: 8,
  },
  progressSection: {
    marginBottom: 16,
  },
  progressHeader: {
    marginBottom: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  uploadButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 12,
  },
  uploadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  // Button row for multiple options
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 8,
  },
  sourceButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    minHeight: 44,
  },
  sourceButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
});

export default DocumentUploadWidget;