import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { Picker } from '@react-native-picker/picker';
import { Ionicons } from '@expo/vector-icons';
import { DocumentService } from '../../../services/documentService';
import DocumentHistory from '../../DocumentHistory';

type Step = 'select' | 'configure' | 'results';
type Tab = 'upload' | 'history';

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
  const [activeTab, setActiveTab] = useState<Tab>('upload');
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

  // Handle back navigation
  const handleBack = () => {
    if (currentStep === 'results') {
      // From results, go back to configure
      setCurrentStep('configure');
    } else if (currentStep === 'configure') {
      // From configure, go back to select and clear file
      setCurrentStep('select');
      setSelectedFile(null);
    }
    // If on select step, do nothing (already at the beginning)
  };

  // Reset to start over
  const handleReset = () => {
    setCurrentStep('select');
    setSelectedFile(null);
    setAnalyzing(false);
    setUploadProgress(0);
    setAnalysisResults(null);
    setAnalysisLanguage('english');
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
        
        // Move to configuration step
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
      // Use the explainDocument method which handles upload and analysis
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
  const renderStepIndicator = () => (
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

  return (
    <View style={styles.container}>
      {/* Tab Selector */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && styles.tabActive]}
          onPress={() => setActiveTab('upload')}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={24}
            color={activeTab === 'upload' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'upload' && styles.tabTextActive]}>
            Upload & Analyze
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.tabActive]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={activeTab === 'history' ? '#007AFF' : '#666'}
          />
          <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'upload' ? (
        <>
          {/* Back Button - Show when not on first step */}
          {currentStep !== 'select' && !analyzing && (
            <View style={styles.backButtonContainer}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color="#007AFF" />
                <Text style={styles.backButtonText}>Back</Text>
              </TouchableOpacity>
            </View>
          )}
          
          {renderStepIndicator()}
          <View style={styles.content}>
            {currentStep === 'select' && renderSelectStep()}
            {currentStep === 'configure' && renderConfigureStep()}
            {currentStep === 'results' && renderResultsStep()}
          </View>
        </>
      ) : (
        <DocumentHistory />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 8,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#007AFF',
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  tabTextActive: {
    color: '#007AFF',
  },
  backButtonContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    fontWeight: '600',
    color: '#007AFF',
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
});
