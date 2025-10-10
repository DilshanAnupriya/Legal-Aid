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
import { DocumentService } from '../../services/documentService';
import DocumentHistory from '../../components/DocumentHistory';
import { applyUnicodeStyle } from '../../utils/unicodeUtils';
import { useTheme } from '../../context/ThemeContext';

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
  const { theme, colors } = useTheme();
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

  // Create a simple summary from the explanation
  const createSummary = (explanation: string) => {
    const sentences = explanation.split('.').filter(sentence => sentence.trim().length > 0);
    // Take the first sentence as a quick summary
    const summary = sentences[0]?.trim() + '.';
    return summary.length > 150 ? summary.substring(0, 147) + '...' : summary;
  };

  // Extract key points from explanation
  const extractKeyPoints = (explanation: string) => {
    const keyWords = ['important', 'key', 'main', 'primary', 'essential', 'significant', 'critical', 'must', 'should', 'required'];
    const sentences = explanation.split('.').filter(sentence => sentence.trim().length > 0);
    
    return sentences.filter(sentence => 
      keyWords.some(keyword => sentence.toLowerCase().includes(keyword))
    ).slice(0, 3); // Limit to top 3 key points
  };
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
    <View style={[styles.stepIndicator, { backgroundColor: colors.white }]}>
      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep === 'select' && styles.stepCircleActive, { backgroundColor: currentStep !== 'select' ? colors.light : colors.primary + '20' }]}>
          <Ionicons 
            name={currentStep !== 'select' ? "checkmark" : "document"} 
            size={20} 
            color={currentStep !== 'select' ? colors.accent : colors.primary} 
          />
        </View>
        <Text style={[styles.stepText, { color: colors.primary }]}>Select PDF</Text>
      </View>

      <View style={[styles.stepLine, { backgroundColor: colors.light }]} />

      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep === 'configure' && styles.stepCircleActive, { backgroundColor: currentStep === 'results' ? colors.light : currentStep === 'configure' ? colors.primary + '20' : colors.light }]}>
          <Ionicons 
            name={currentStep === 'results' ? "checkmark" : "settings"} 
            size={20} 
            color={currentStep === 'results' ? colors.accent : currentStep === 'configure' ? colors.primary : colors.darkgray} 
          />
        </View>
        <Text style={[styles.stepText, { color: colors.primary }]}>Configure</Text>
      </View>

      <View style={[styles.stepLine, { backgroundColor: colors.light }]} />

      <View style={styles.stepItem}>
        <View style={[styles.stepCircle, currentStep === 'results' && styles.stepCircleActive, { backgroundColor: currentStep === 'results' ? colors.primary + '20' : colors.light }]}>
          <Ionicons 
            name="eye" 
            size={20} 
            color={currentStep === 'results' ? colors.primary : colors.darkgray} 
          />
        </View>
        <Text style={[styles.stepText, { color: colors.primary }]}>Results</Text>
      </View>
    </View>
  );

  // Render Step 1: Select Document
  const renderSelectStep = () => (
    <View style={styles.stepContent}>
      <View style={[styles.uploadArea, { backgroundColor: colors.white }]}>
        <Ionicons name="cloud-upload-outline" size={80} color={colors.primary} />
        <Text style={[styles.uploadTitle, { color: colors.primary }]}>Upload Legal Document</Text>
        <Text style={[styles.uploadSubtitle, { color: colors.darkgray }]}>Select a PDF file for AI analysis</Text>
        
        <TouchableOpacity style={[styles.selectButton, { backgroundColor: colors.primary }]} onPress={handleSelectFile}>
          <Ionicons name="folder-open-outline" size={24} color={colors.white} />
          <Text style={[styles.selectButtonText, { color: colors.white }]}>Select PDF Document</Text>
        </TouchableOpacity>

        <View style={[styles.infoBox, { backgroundColor: colors.primary + '10' }]}>
          <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
          <Text style={[styles.infoText, { color: colors.primary }]}>
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
        <View style={[styles.fileInfoCard, { backgroundColor: colors.white }]}>
          <Ionicons name="document-text" size={48} color={colors.primary} />
          <Text style={[styles.fileName, { color: colors.primary }]}>{selectedFile?.name || 'No file'}</Text>
          <Text style={[styles.fileSize, { color: colors.darkgray }]}>
            {selectedFile?.size ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : ''}
          </Text>
          
          <TouchableOpacity style={[styles.changeFileButton, { backgroundColor: colors.light }]} onPress={() => setCurrentStep('select')}>
            <Ionicons name="swap-horizontal" size={18} color={colors.primary} />
            <Text style={[styles.changeFileText, { color: colors.primary }]}>Change File</Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.languageSection, { backgroundColor: colors.white }]}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>Analysis Language</Text>
          <Text style={[styles.sectionSubtitle, { color: colors.darkgray }]}>
            Select the language for AI explanation and summary
          </Text>
          
          <View style={[styles.languagePickerContainer, { backgroundColor: colors.light }]}>
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
          style={[styles.analyzeButton, { backgroundColor: colors.accent }]}
          onPress={handleAnalyze}
          disabled={analyzing}
        >
          {analyzing ? (
            <>
              <ActivityIndicator color={colors.white} size="small" />
              <Text style={[styles.analyzeButtonText, { color: colors.white }]}>
                Analyzing... {uploadProgress}%
              </Text>
            </>
          ) : (
            <>
              <Ionicons name="flash" size={24} color={colors.white} />
              <Text style={[styles.analyzeButtonText, { color: colors.white }]}>Analyze Document</Text>
            </>
          )}
        </TouchableOpacity>

        {analyzing && (
          <View style={styles.progressContainer}>
            <View style={[styles.progressBar, { backgroundColor: colors.light }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.accent, width: `${uploadProgress}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.darkgray }]}>
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
      <View style={[styles.resultsCard, { backgroundColor: colors.white }]}>
        <View style={[styles.resultsHeader, { borderBottomColor: colors.light }]}>
          <Ionicons name="checkmark-circle" size={48} color={colors.accent} />
          <Text style={[styles.resultsTitle, { color: colors.primary }]}>Analysis Complete!</Text>
          <Text style={[styles.resultsSubtitle, { color: colors.darkgray }]}>
            Document analyzed in {analysisLanguage.charAt(0).toUpperCase() + analysisLanguage.slice(1)}
          </Text>
        </View>

        {analysisResults?.explanation && (
          <View style={styles.explanationSection}>
            <View style={styles.sectionHeader}>
              <Ionicons name="document-text-outline" size={24} color={colors.primary} />
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>AI Analysis Summary</Text>
            </View>
            
            {/* Quick Summary */}
            <View style={[styles.quickSummary, { backgroundColor: colors.primary + '10', borderLeftColor: colors.primary }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="flash-outline" size={18} color={colors.primary} />
                <Text style={[styles.summaryTitle, { color: colors.primary }]}>Quick Summary</Text>
              </View>
              <Text style={[styles.summaryText, { color: colors.primary }]}>
                {createSummary(analysisResults.explanation)}
              </Text>
            </View>
            
            {/* Key Points Section */}
            {extractKeyPoints(analysisResults.explanation).length > 0 && (
              <View style={[styles.keyPointsContainer, { backgroundColor: colors.accent + '10', borderLeftColor: colors.accent }]}>
                <View style={styles.keyPointsHeader}>
                  <Ionicons name="bulb-outline" size={18} color={colors.accent} />
                  <Text style={[styles.keyPointsTitle, { color: colors.accent }]}>Key Points</Text>
                </View>
                {extractKeyPoints(analysisResults.explanation).map((point: string, index: number) => (
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
              
              {formatExplanation(analysisResults.explanation).map((paragraph, index) => (
                <View key={index} style={styles.paragraphContainer}>
                  <Text 
                    style={[
                      applyUnicodeStyle(styles.explanationText, paragraph, analysisLanguage),
                      { color: colors.primary }
                    ]}
                  >
                    {paragraph}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {(analysisResults?.wordCount || analysisResults?.confidence) && (
          <View style={styles.statsContainer}>
            {analysisResults.wordCount ? (
              <View style={styles.statBox}>
                <Ionicons name="text-outline" size={24} color={colors.orange} />
                <Text style={[styles.statValue, { color: colors.primary }]}>{analysisResults.wordCount}</Text>
                <Text style={[styles.statLabel, { color: colors.darkgray }]}>Words</Text>
              </View>
            ) : null}
            
            {analysisResults.characterCount ? (
              <View style={styles.statBox}>
                <Ionicons name="reader-outline" size={24} color={colors.secondary} />
                <Text style={[styles.statValue, { color: colors.primary }]}>{analysisResults.characterCount}</Text>
                <Text style={[styles.statLabel, { color: colors.darkgray }]}>Characters</Text>
              </View>
            ) : null}

            {analysisResults.confidence ? (
              <View style={styles.statBox}>
                <Ionicons name="analytics-outline" size={24} color={colors.accent} />
                <Text style={[styles.statValue, { color: colors.primary }]}>{Math.round(analysisResults.confidence * 100)}%</Text>
                <Text style={[styles.statLabel, { color: colors.darkgray }]}>Confidence</Text>
              </View>
            ) : null}
          </View>
        )}

        <TouchableOpacity style={[styles.newAnalysisButton, { borderColor: colors.primary }]} onPress={handleReset}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
          <Text style={[styles.newAnalysisText, { color: colors.primary }]}>Analyze Another Document</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.light }]}>
      {/* Tab Selector */}
      <View style={[styles.tabContainer, { backgroundColor: colors.white, borderBottomColor: colors.light }]}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'upload' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('upload')}
        >
          <Ionicons
            name="cloud-upload-outline"
            size={24}
            color={activeTab === 'upload' ? colors.primary : colors.darkgray}
          />
          <Text style={[styles.tabText, activeTab === 'upload' && [styles.tabTextActive, { color: colors.primary }], { color: activeTab === 'upload' ? colors.primary : colors.darkgray }]}>
            Upload & Analyze
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && [styles.tabActive, { borderBottomColor: colors.primary }]]}
          onPress={() => setActiveTab('history')}
        >
          <Ionicons
            name="time-outline"
            size={24}
            color={activeTab === 'history' ? colors.primary : colors.darkgray}
          />
          <Text style={[styles.tabText, activeTab === 'history' && [styles.tabTextActive, { color: colors.primary }], { color: activeTab === 'history' ? colors.primary : colors.darkgray }]}>
            History
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      {activeTab === 'upload' ? (
        <>
          {/* Back Button - Show when not on first step */}
          {currentStep !== 'select' && !analyzing && (
            <View style={[styles.backButtonContainer, { backgroundColor: colors.white, borderBottomColor: colors.light }]}>
              <TouchableOpacity style={styles.backButton} onPress={handleBack}>
                <Ionicons name="arrow-back" size={24} color={colors.primary} />
                <Text style={[styles.backButtonText, { color: colors.primary }]}>Back</Text>
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
  },
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    // borderBottomColor will be set dynamically
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
  },
  tabTextActive: {
    // color will be set dynamically
  },
  backButtonContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  stepItem: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  stepCircleActive: {
    // backgroundColor will be set dynamically
  },
  stepText: {
    fontSize: 12,
    fontWeight: '500',
  },
  stepLine: {
    width: 40,
    height: 2,
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
    borderRadius: 12,
    margin: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  uploadTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 8,
    textAlign: 'center',
  },
  uploadSubtitle: {
    fontSize: 16,
    marginBottom: 32,
    textAlign: 'center',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  selectButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    borderRadius: 12,
    marginTop: 32,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  configCard: {
    flex: 1,
  },
  fileInfoCard: {
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  fileName: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 12,
    textAlign: 'center',
  },
  fileSize: {
    fontSize: 14,
    marginTop: 4,
  },
  changeFileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  changeFileText: {
    fontSize: 14,
    fontWeight: '500',
  },
  languageSection: {
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  languagePickerContainer: {
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
    paddingVertical: 16,
    borderRadius: 12,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  analyzeButtonText: {
    fontSize: 18,
    fontWeight: '600',
  },
  progressContainer: {
    marginTop: 20,
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
  progressText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
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
  },
  explanationSection: {
    marginBottom: 24,
  },
  quickSummary: {
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    marginBottom: 20,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  summaryText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '500',
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
    flex: 1,
  },
  readAloudButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  readAloudText: {
    fontSize: 12,
    fontWeight: '500',
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
  explanationText: {
    fontSize: 16,
    lineHeight: 28,
    textAlign: 'justify',
    color: '#333', // Default color, will be overridden by theme
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
  newAnalysisButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 12,
    borderWidth: 2,
    borderRadius: 12,
  },
  newAnalysisText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
