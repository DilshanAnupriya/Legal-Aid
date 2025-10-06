import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { DocumentService } from '../../services/documentService';
import { Document } from '@/types/document';

type Step = 'select' | 'configure' | 'results' | 'history';

interface LanguageOption {
  label: string;
  value: string;
}

const LANGUAGES: LanguageOption[] = [
  { label: 'English', value: 'english' },
  { label: 'Sinhala', value: 'sinhala' },
  { label: 'Tamil', value: 'tamil' },
];

export default function DocumentAnalyseScreen() {
  const [currentStep, setCurrentStep] = useState<Step>('select');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  // Analysis options
  const [analysisLanguage, setAnalysisLanguage] = useState<'english' | 'sinhala' | 'tamil'>('english');
  
  // Results
  const [analysisResults, setAnalysisResults] = useState<{
    explanation?: string;
    confidence?: number;
    wordCount?: number;
    characterCount?: number;
  } | null>(null);

  // History
  const [documentHistory, setDocumentHistory] = useState<Document[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [hasMoreHistory, setHasMoreHistory] = useState(true);

  // Load document history
  const loadDocumentHistory = useCallback(async (page: number = 1, append: boolean = false) => {
    if (!append) {
      setLoadingHistory(true);
    }

    try {
      const response = await DocumentService.getDocuments(page, 10);
      
      if (response.success) {
        if (append) {
          setDocumentHistory(prev => [...prev, ...response.documents]);
        } else {
          setDocumentHistory(response.documents);
        }
        
        setHasMoreHistory(response.documents.length === 10);
        setHistoryPage(page);
      } else {
        if (!append) {
          console.error('Failed to load history:', response.error);
        }
      }
    } catch (error: any) {
      console.error('Error loading history:', error);
    } finally {
      setLoadingHistory(false);
      setRefreshing(false);
    }
  }, []);

  // Load document history on mount
  useEffect(() => {
    loadDocumentHistory();
  }, [loadDocumentHistory]);

  // Refresh history
  const handleRefreshHistory = () => {
    setRefreshing(true);
    loadDocumentHistory(1, false);
  };

  // Load more history
  const handleLoadMoreHistory = () => {
    if (!loadingHistory && hasMoreHistory) {
      loadDocumentHistory(historyPage + 1, true);
    }
  };

  // View document from history
  const handleViewDocument = (document: Document) => {
    if (document.aiExplanation) {
      setAnalysisResults({
        explanation: document.aiExplanation,
        confidence: 0.95,
        wordCount: document.aiExplanation.split(' ').length,
        characterCount: document.aiExplanation.length,
      });
      setAnalysisLanguage((document.explanationLanguage as 'english' | 'sinhala' | 'tamil') || 'english');
      setCurrentStep('results');
    } else {
      Alert.alert('No Analysis', 'This document has not been analyzed yet.');
    }
  };

  // Delete document from history
  const handleDeleteDocument = async (documentId: string) => {
    Alert.alert(
      'Delete Document',
      'Are you sure you want to delete this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await DocumentService.deleteDocument(documentId);
              if (response.success) {
                Alert.alert('Success', 'Document deleted successfully');
                loadDocumentHistory(1, false);
              } else {
                Alert.alert('Error', response.message || 'Failed to delete document');
              }
            } catch (error: any) {
              console.error('Error deleting document:', error);
              Alert.alert('Error', 'Failed to delete document');
            }
          },
        },
      ]
    );
  };

  // Reset to start over
  const handleReset = () => {
    setCurrentStep('select');
    setSelectedFile(null);
    setAnalyzing(false);
    setUploadProgress(0);
    setAnalysisResults(null);
    setAnalysisLanguage('english');
    loadDocumentHistory(1, false);
  };

  // Handle file selection
  const handleSelectFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const file = result.assets[0];
        setSelectedFile({
          uri: file.uri,
          name: file.name,
          type: file.mimeType || 'application/pdf',
          size: file.size,
          mimeType: file.mimeType || 'application/pdf',
        });
        setCurrentStep('configure');
      }
    } catch (error) {
      console.error('Error selecting file:', error);
      Alert.alert('Error', 'Failed to select file. Please try again.');
    }
  };

  // Handle analysis
  const handleAnalyze = async () => {
    if (!selectedFile) {
      Alert.alert('Error', 'No document selected');
      return;
    }

    setAnalyzing(true);
    setUploadProgress(0);

    try {
      const response = await DocumentService.explainDocument(
        selectedFile,
        analysisLanguage,
        (progress) => {
          setUploadProgress(progress.percentage);
        }
      );

      if (response.success) {
        setAnalysisResults({
          explanation: response.explanation,
          confidence: response.confidence,
          wordCount: response.wordCount,
          characterCount: response.characterCount,
        });
        setCurrentStep('results');
        Alert.alert('Success', 'Document analyzed successfully!');
        loadDocumentHistory(1, false);
      } else {
        Alert.alert('Error', response.error || 'Failed to analyze document. Please try again.');
      }
    } catch (error: any) {
      console.error('Analysis error:', error);
      Alert.alert('Error', error.message || 'An error occurred during analysis. Please try again.');
    } finally {
      setAnalyzing(false);
      setUploadProgress(0);
    }
  };

  // Render Step Indicator
  const renderStepIndicator = () => {
    if (currentStep === 'history') {
      return (
        <View style={styles.historyHeader}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => setCurrentStep('select')}
          >
            <Ionicons name="arrow-back" size={24} color="#007AFF" />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.historyTitle}>Document History</Text>
          <TouchableOpacity 
            style={styles.refreshButton} 
            onPress={handleRefreshHistory}
          >
            <Ionicons name="refresh" size={24} color="#007AFF" />
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stepIndicator}>
        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, currentStep === 'select' && styles.stepCircleActive]}>
            <Ionicons 
              name={currentStep !== 'select' ? "checkmark" : "document"} 
              size={20} 
              color={currentStep !== 'select' ? "#4CAF50" : "#007AFF"} 
            />
          </View>
          <Text style={styles.stepText}>Select PDF</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, currentStep === 'configure' && styles.stepCircleActive]}>
            <Ionicons 
              name={currentStep === 'results' ? "checkmark" : "settings"} 
              size={20} 
              color={currentStep === 'results' ? "#4CAF50" : currentStep === 'configure' ? "#007AFF" : "#ccc"} 
            />
          </View>
          <Text style={styles.stepText}>Configure</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, currentStep === 'results' && styles.stepCircleActive]}>
            <Ionicons 
              name="eye" 
              size={20} 
              color={currentStep === 'results' ? "#007AFF" : "#ccc"} 
            />
          </View>
          <Text style={styles.stepText}>Results</Text>
        </View>
      </View>
    );
  };

  // Render Step 1: Select Document
  const renderSelectStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.uploadArea}>
        <Ionicons name="cloud-upload-outline" size={80} color="#007AFF" />
        <Text style={styles.uploadTitle}>Upload Legal Document</Text>
        <Text style={styles.uploadSubtitle}>Select a PDF file for AI analysis</Text>
        
        <TouchableOpacity style={styles.selectButton} onPress={handleSelectFile}>
          <Ionicons name="folder-open-outline" size={24} color="#fff" />
          <Text style={styles.selectButtonText}>Select PDF Document</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.historyButton} 
          onPress={() => setCurrentStep('history')}
        >
          <Ionicons name="time-outline" size={24} color="#007AFF" />
          <Text style={styles.historyButtonText}>View Document History</Text>
        </TouchableOpacity>

        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            Only PDF files are supported. The AI will analyze and explain the document in your chosen language.
          </Text>
        </View>
      </View>
    </View>
  );

  // Render Step 2: Configure Analysis
  const renderConfigureStep = () => (
    <View style={styles.stepContent}>
      <View style={styles.configCard}>
        <View style={styles.fileInfoCard}>
          <Ionicons name="document-text" size={48} color="#007AFF" />
          <Text style={styles.fileName}>{selectedFile?.name || 'No file'}</Text>
          <Text style={styles.fileSize}>
            {selectedFile?.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
          </Text>
          
          <TouchableOpacity style={styles.changeFileButton} onPress={() => setCurrentStep('select')}>
            <Ionicons name="swap-horizontal" size={18} color="#007AFF" />
            <Text style={styles.changeFileText}>Change File</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.languageSection}>
          <Text style={styles.sectionTitle}>Analysis Language</Text>
          <Text style={styles.sectionSubtitle}>
            Select the language for AI explanation and summary
          </Text>
          
          <View style={styles.languagePickerContainer}>
            <Picker
              selectedValue={analysisLanguage}
              onValueChange={(value) => setAnalysisLanguage(value as 'english' | 'sinhala' | 'tamil')}
              style={styles.languagePicker}
            >
              {LANGUAGES.map((lang) => (
                <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
              ))}
            </Picker>
          </View>
        </View>

        <TouchableOpacity
          style={styles.analyzeButton}
          onPress={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <ActivityIndicator color="#fff" size="small" />
              <Text style={styles.analyzeButtonText}>
                Analyzing... {uploadProgress}%
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={24} color="#fff" />
              <Text style={styles.analyzeButtonText}>Analyze Document</Text>
            </>
          )}
        </TouchableOpacity>

        {analyzing && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
            </View>
            <Text style={styles.progressText}>
              {uploadProgress < 50 ? 'Uploading document...' : 'AI is analyzing...'}
            </Text>
          </View>
        )}
      </View>
    </View>
  );

  // Render Step 3: Results
  const renderResultsStep = () => (
    <ScrollView style={styles.stepContent}>
      <TouchableOpacity style={styles.resultsBackButton} onPress={() => setCurrentStep('select')}>
        <Ionicons name="arrow-back" size={24} color="#007AFF" />
        <Text style={styles.resultsBackButtonText}>Back to Upload</Text>
      </TouchableOpacity>
      
      <View style={styles.resultsCard}>
        <View style={styles.resultsHeader}>
          <Ionicons name="checkmark-circle" size={48} color="#4CAF50" />
          <Text style={styles.resultsTitle}>Analysis Complete!</Text>
          <Text style={styles.resultsSubtitle}>
            Document analyzed in {analysisLanguage.charAt(0).toUpperCase() + analysisLanguage.slice(1)}
          </Text>
        </View>

        {analysisResults?.explanation && (
          <View style={styles.explanationSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color="#007AFF" />
              <Text style={styles.sectionTitle}>AI Explanation</Text>
            </View>
            <Text style={styles.explanationText}>{analysisResults.explanation}</Text>
          </View>
        )}

        {(analysisResults?.wordCount || analysisResults?.confidence) && (
          <View style={styles.statsContainer}>
            {analysisResults.wordCount ? (
              <View style={styles.statBox}>
                <Ionicons name="text-outline" size={24} color="#FF9800" />
                <Text style={styles.statValue}>{analysisResults.wordCount}</Text>
                <Text style={styles.statLabel}>Words</Text>
              </View>
            ) : null}
            
            {analysisResults.characterCount ? (
              <View style={styles.statBox}>
                <Ionicons name="reader-outline" size={24} color="#2196F3" />
                <Text style={styles.statValue}>{analysisResults.characterCount}</Text>
                <Text style={styles.statLabel}>Characters</Text>
              </View>
            ) : null}

            {analysisResults.confidence ? (
              <View style={styles.statBox}>
                <Ionicons name="analytics-outline" size={24} color="#4CAF50" />
                <Text style={styles.statValue}>{Math.round(analysisResults.confidence * 100)}%</Text>
                <Text style={styles.statLabel}>Confidence</Text>
              </View>
            ) : null}
          </View>
        )}

        <TouchableOpacity style={styles.newAnalysisButton} onPress={handleReset}>
          <Ionicons name="add-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.newAnalysisText}>Analyze Another Document</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  // Render History List Item
  const renderHistoryItem = ({ item }: { item: Document }) => {
    const uploadDate = new Date(item.uploadDate);
    const formattedDate = uploadDate.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const formattedTime = uploadDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const getStatusColor = () => {
      switch (item.aiStatus) {
        case 'completed':
          return '#4CAF50';
        case 'processing':
          return '#FF9800';
        case 'failed':
          return '#F44336';
        default:
          return '#9E9E9E';
      }
    };

    const getStatusIcon = () => {
      switch (item.aiStatus) {
        case 'completed':
          return 'checkmark-circle';
        case 'processing':
          return 'sync-circle';
        case 'failed':
          return 'close-circle';
        default:
          return 'time';
      }
    };

    return (
      <View style={styles.historyItem}>
        <View style={styles.historyItemIcon}>
          <Ionicons name="document-text" size={32} color="#007AFF" />
        </View>
        
        <View style={styles.historyItemContent}>
          <Text style={styles.historyItemTitle} numberOfLines={1}>
            {item.originalName || item.fileName}
          </Text>
          
          <View style={styles.historyItemMeta}>
            <Text style={styles.historyItemDate}>{formattedDate} • {formattedTime}</Text>
            {item.explanationLanguage && (
              <Text style={styles.historyItemLanguage}>
                {item.explanationLanguage.charAt(0).toUpperCase() + item.explanationLanguage.slice(1)}
              </Text>
            )}
          </View>

          <View style={styles.historyItemStatus}>
            <Ionicons name={getStatusIcon()} size={16} color={getStatusColor()} />
            <Text style={[styles.historyItemStatusText, { color: getStatusColor() }]}>
              {item.aiStatus ? item.aiStatus.charAt(0).toUpperCase() + item.aiStatus.slice(1) : 'Pending'}
            </Text>
          </View>
        </View>

        <View style={styles.historyItemActions}>
          {item.isProcessed && item.aiExplanation && (
            <TouchableOpacity
              style={styles.historyItemButton}
              onPress={() => handleViewDocument(item)}
            >
              <Ionicons name="eye" size={20} color="#007AFF" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.historyItemButton}
            onPress={() => handleDeleteDocument(item._id)}
          >
            <Ionicons name="trash" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // Render History Step
  const renderHistoryStep = () => (
    <View style={styles.historyContainer}>
      {loadingHistory && documentHistory.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading document history...</Text>
        </View>
      ) : documentHistory.length === 0 ? (
        <View style={styles.emptyHistoryContainer}>
          <Ionicons name="document-text-outline" size={80} color="#ccc" />
          <Text style={styles.emptyHistoryTitle}>No Documents Yet</Text>
          <Text style={styles.emptyHistorySubtitle}>
            Start by uploading and analyzing a PDF document
          </Text>
          <TouchableOpacity 
            style={styles.emptyHistoryButton} 
            onPress={() => setCurrentStep('select')}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.emptyHistoryButtonText}>Upload Document</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={documentHistory}
          renderItem={renderHistoryItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.historyList}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefreshHistory}
              colors={['#007AFF']}
            />
          }
          onEndReached={handleLoadMoreHistory}
          onEndReachedThreshold={0.5}
          ListFooterComponent={() =>
            loadingHistory && documentHistory.length > 0 ? (
              <View style={styles.historyFooter}>
                <ActivityIndicator size="small" color="#007AFF" />
              </View>
            ) : null
          }
        />
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      {renderStepIndicator()}
      
      <View style={styles.content}>
        {currentStep === 'select' && renderSelectStep()}
        {currentStep === 'configure' && renderConfigureStep()}
        {currentStep === 'results' && renderResultsStep()}
        {currentStep === 'history' && renderHistoryStep()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  stepCircleActive: {
    backgroundColor: '#E3F2FD',
  },
  stepText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 2,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 8,
    marginBottom: 32,
  },
  content: {
    flex: 1,
  },
  stepContent: {
    flex: 1,
    padding: 20,
  },
  uploadArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  uploadSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  selectButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    marginTop: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  historyButtonText: {
    color: '#007AFF',
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#E3F2FD',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#1976D2',
    lineHeight: 20,
  },
  configCard: {
    flex: 1,
  },
  fileInfoCard: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginTop: 12,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  changeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    gap: 8,
  },
  changeFileText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  languageSection: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  languagePickerContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    overflow: 'hidden',
  },
  languagePicker: {
    height: 50,
  },
  analyzeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
  },
  analyzeButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
    color: '#666',
  },
  resultsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
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
  explanationText: {
    fontSize: 16,
    lineHeight: 28,
    color: '#333',
    textAlign: 'justify',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  },
  newAnalysisText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
  historyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  refreshButton: {
    padding: 4,
  },
  historyContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  emptyHistoryContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyHistoryTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  emptyHistorySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  emptyHistoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
  },
  emptyHistoryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  historyList: {
    padding: 16,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  historyItemIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyItemContent: {
    flex: 1,
  },
  historyItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  historyItemMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  historyItemDate: {
    fontSize: 12,
    color: '#666',
  },
  historyItemLanguage: {
    fontSize: 12,
    color: '#007AFF',
    backgroundColor: '#E3F2FD',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  historyItemStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  historyItemStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  historyItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  historyItemButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyFooter: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  resultsBackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  resultsBackButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
  },
});
