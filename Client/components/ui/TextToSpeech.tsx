import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Dimensions,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import useTTS from '../../hooks/useTTS';

const { width } = Dimensions.get('window');

interface TextToSpeechProps {
  initialText?: string;
  showAdvancedControls?: boolean;
  onSpeakStart?: () => void;
  onSpeakEnd?: () => void;
}

const TextToSpeech: React.FC<TextToSpeechProps> = ({
  initialText = '',
  showAdvancedControls = true,
  onSpeakStart,
  onSpeakEnd,
}) => {
  const { colors, theme } = useTheme();
  const { t } = useTranslation();
  const [inputText, setInputText] = useState(initialText);
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  const {
    // State
    isSpeaking,
    availableVoices,
    currentLanguage,
    speechRate,
    speechPitch,
    isInitialized,
    error,
    supportedLanguages,
    
    // Actions
    speak,
    stopSpeaking,
    setRate,
    setPitch,
    setCurrentLanguage,
    
    // Utilities
    getVoicesForLanguage,
    isLanguageAvailable,
    clearError,
  } = useTTS();

  const styles = createStyles(colors, theme);

  // Handle speak button press
  const handleSpeak = async () => {
    if (!inputText.trim()) {
      Alert.alert('No Text', 'Please enter some text to speak.');
      return;
    }

    if (isSpeaking) {
      await stopSpeaking();
      onSpeakEnd?.();
    } else {
      onSpeakStart?.();
      await speak(inputText, currentLanguage);
    }
  };

  // Handle language change
  const handleLanguageChange = (langCode: string) => {
    setCurrentLanguage(langCode);
    
    // Show warning for Sinhala if not available
    if (langCode === 'si-LK' && !isLanguageAvailable(langCode)) {
      Alert.alert(
        'Sinhala Voice Not Available',
        'Sinhala text-to-speech is not available on this device. Please install Sinhala language support from your device settings.',
        [{ text: 'OK' }]
      );
    }
  };

  // Handle rate change
  const handleRateChange = (value: number) => {
    setRate(value);
  };

  // Handle pitch change
  const handlePitchChange = (value: number) => {
    setPitch(value);
  };

  // Get sample text based on language
  const getSampleText = (langCode: string) => {
    switch (langCode) {
      case 'en-US':
        return 'Hello, this is a sample text for English text-to-speech.';
      case 'ta-IN':
        return 'வணக்கம், இது தமிழ் உரையிலிருந்து பேச்சுக்கான மாதிரி உரை.';
      case 'si-LK':
        return 'ආයුබෝවන්, මෙය සිංහල පාඨයෙන් කථනය සඳහා නියැදි පාඨයකි.';
      default:
        return 'Sample text for text-to-speech.';
    }
  };

  // Set sample text for current language
  const setSampleText = () => {
    setInputText(getSampleText(currentLanguage));
  };

  useEffect(() => {
    if (initialText) {
      setInputText(initialText);
    }
  }, [initialText]);

  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Ionicons name="volume-medium" size={48} color={colors.primary} />
          <Text style={styles.loadingText}>Initializing Text-to-Speech...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Ionicons name="volume-high-outline" size={24} color={colors.primary} />
          <Text style={styles.headerTitle}>Text to Speech</Text>
          {showAdvancedControls && (
            <TouchableOpacity
              onPress={() => setShowAdvanced(!showAdvanced)}
              style={styles.settingsButton}
            >
              <Ionicons 
                name={showAdvanced ? "settings" : "settings-outline"} 
                size={20} 
                color={colors.primary} 
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Display */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="warning" size={16} color="#FF6B6B" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={clearError}>
              <Ionicons name="close" size={16} color="#FF6B6B" />
            </TouchableOpacity>
          </View>
        )}

        {/* Language Selector */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Language</Text>
          <View style={styles.languageContainer}>
            {Object.entries(supportedLanguages).map(([code, config]) => {
              const available = isLanguageAvailable(code);
              const isSelected = currentLanguage === code;
              
              return (
                <TouchableOpacity
                  key={code}
                  style={[
                    styles.languageButton,
                    isSelected && styles.languageButtonSelected,
                    !available && styles.languageButtonDisabled
                  ]}
                  onPress={() => handleLanguageChange(code)}
                  disabled={!available}
                >
                  <Text style={[
                    styles.languageButtonText,
                    isSelected && styles.languageButtonTextSelected,
                    !available && styles.languageButtonTextDisabled
                  ]}>
                    {config.name}
                  </Text>
                  {!available && (
                    <Ionicons name="warning-outline" size={12} color="#FF6B6B" />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Text Input */}
        <View style={styles.section}>
          <View style={styles.inputHeader}>
            <Text style={styles.sectionTitle}>Text to Speak</Text>
            <TouchableOpacity onPress={setSampleText} style={styles.sampleButton}>
              <Text style={styles.sampleButtonText}>Sample</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Enter text in ${supportedLanguages[currentLanguage]?.name}...`}
            placeholderTextColor={theme === 'dark' ? colors.darkgray : '#999'}
            multiline
            textAlignVertical="top"
            maxLength={1000}
          />
          <Text style={styles.characterCount}>{inputText.length}/1000</Text>
        </View>

        {/* Advanced Controls */}
        {showAdvanced && showAdvancedControls && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Voice Settings</Text>
            
            {/* Speech Rate */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                Speech Rate: {speechRate.toFixed(1)}x
              </Text>
              <View style={styles.sliderRow}>
                <TouchableOpacity onPress={() => handleRateChange(Math.max(0.1, speechRate - 0.1))}>
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill, 
                      { width: `${speechRate * 100}%` }
                    ]} 
                  />
                </View>
                <TouchableOpacity onPress={() => handleRateChange(Math.min(2.0, speechRate + 0.1))}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Speech Pitch */}
            <View style={styles.sliderContainer}>
              <Text style={styles.sliderLabel}>
                Speech Pitch: {speechPitch.toFixed(1)}x
              </Text>
              <View style={styles.sliderRow}>
                <TouchableOpacity onPress={() => handlePitchChange(Math.max(0.5, speechPitch - 0.1))}>
                  <Ionicons name="remove" size={20} color={colors.primary} />
                </TouchableOpacity>
                <View style={styles.sliderTrack}>
                  <View 
                    style={[
                      styles.sliderFill, 
                      { width: `${((speechPitch - 0.5) / 1.5) * 100}%` }
                    ]} 
                  />
                </View>
                <TouchableOpacity onPress={() => handlePitchChange(Math.min(2.0, speechPitch + 0.1))}>
                  <Ionicons name="add" size={20} color={colors.primary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Voice Info */}
            <View style={styles.voiceInfo}>
              <Text style={styles.voiceInfoText}>
                Available voices for {supportedLanguages[currentLanguage]?.name}: {getVoicesForLanguage(currentLanguage).length}
              </Text>
            </View>
          </View>
        )}

        {/* Control Buttons */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity
            style={[
              styles.speakButton,
              isSpeaking && styles.speakButtonActive,
              !inputText.trim() && styles.speakButtonDisabled
            ]}
            onPress={handleSpeak}
            disabled={!inputText.trim()}
          >
            <Ionicons 
              name={isSpeaking ? "stop" : "play"} 
              size={24} 
              color="white" 
            />
            <Text style={styles.speakButtonText}>
              {isSpeaking ? 'Stop' : 'Speak'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setInputText('')}
          >
            <Ionicons name="trash-outline" size={20} color={colors.primary} />
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {/* Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusItem}>
            <Ionicons 
              name={isInitialized ? "checkmark-circle" : "close-circle"} 
              size={16} 
              color={isInitialized ? "#4CAF50" : "#FF6B6B"} 
            />
            <Text style={styles.statusText}>
              TTS {isInitialized ? 'Ready' : 'Not Ready'}
            </Text>
          </View>
          
          <View style={styles.statusItem}>
            <Ionicons 
              name={isLanguageAvailable(currentLanguage) ? "checkmark-circle" : "warning"} 
              size={16} 
              color={isLanguageAvailable(currentLanguage) ? "#4CAF50" : "#FF6B6B"} 
            />
            <Text style={styles.statusText}>
              {supportedLanguages[currentLanguage]?.name} {isLanguageAvailable(currentLanguage) ? 'Available' : 'Unavailable'}
            </Text>
          </View>
        </View>

        {/* Debug Info (Development only) */}
        {__DEV__ && (
          <View style={styles.debugContainer}>
            <Text style={styles.debugTitle}>Debug Info</Text>
            <Text style={styles.debugText}>Total Voices: {availableVoices.length}</Text>
            <Text style={styles.debugText}>Current Language: {currentLanguage}</Text>
            <Text style={styles.debugText}>Is Speaking: {isSpeaking.toString()}</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any, theme: string) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme === 'dark' ? colors.light : '#F8F9FA',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: theme === 'dark' ? colors.primary : '#666',
    textAlign: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme === 'dark' ? colors.darkgray : '#E5E5E5',
  },
  headerTitle: {
    flex: 1,
    fontSize: 20,
    fontWeight: '600',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    marginLeft: 12,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: theme === 'dark' ? colors.white : '#F0F0F0',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFE6E6',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#FF6B6B',
    marginLeft: 8,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    marginBottom: 12,
  },
  languageContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme === 'dark' ? colors.secondary : '#E0E0E0',
  },
  languageButtonSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  languageButtonDisabled: {
    backgroundColor: theme === 'dark' ? colors.secondary : '#F5F5F5',
    opacity: 0.6,
  },
  languageButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    marginRight: 4,
  },
  languageButtonTextSelected: {
    color: '#FFFFFF',
  },
  languageButtonTextDisabled: {
    color: '#999',
  },
  inputHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sampleButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: colors.accent,
    borderRadius: 12,
  },
  sampleButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  textInput: {
    backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    borderWidth: 1,
    borderColor: theme === 'dark' ? colors.secondary : '#E0E0E0',
    minHeight: 120,
    maxHeight: 200,
    textAlignVertical: 'top',
  },
  characterCount: {
    textAlign: 'right',
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  sliderContainer: {
    marginBottom: 16,
  },
  sliderLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    marginBottom: 8,
  },
  sliderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sliderTrack: {
    flex: 1,
    height: 4,
    backgroundColor: theme === 'dark' ? colors.secondary : '#E0E0E0',
    borderRadius: 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
  voiceInfo: {
    padding: 12,
    backgroundColor: theme === 'dark' ? colors.white : '#F0F0F0',
    borderRadius: 8,
    marginTop: 8,
  },
  voiceInfoText: {
    fontSize: 12,
    color: theme === 'dark' ? colors.primary : '#666',
  },
  controlsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  speakButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  speakButtonActive: {
    backgroundColor: colors.accent,
  },
  speakButtonDisabled: {
    backgroundColor: '#CCC',
    opacity: 0.6,
  },
  speakButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.primary,
    gap: 6,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: colors.primary,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusText: {
    fontSize: 12,
    color: theme === 'dark' ? colors.primary : '#666',
  },
  debugContainer: {
    padding: 12,
    backgroundColor: theme === 'dark' ? colors.white : '#F0F0F0',
    borderRadius: 8,
    marginTop: 16,
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme === 'dark' ? colors.primary : '#2C3E50',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: theme === 'dark' ? colors.primary : '#666',
    marginBottom: 2,
  },
});

export default TextToSpeech;
