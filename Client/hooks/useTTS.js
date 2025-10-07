import { useState, useEffect, useCallback } from 'react';
import * as Speech from 'expo-speech';

/**
 * Custom hook for Text-to-Speech functionality using Expo Speech
 * Supports multiple languages with proper error handling
 */
export const useTTS = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  const [speechRate, setSpeechRate] = useState(0.75);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Language configurations
  const supportedLanguages = {
    'en-US': { name: 'English', code: 'en-US', fallback: 'en' },
    'ta-IN': { name: 'Tamil', code: 'ta-IN', fallback: 'ta' },
    'si-LK': { name: 'Sinhala', code: 'si-LK', fallback: 'si' }
  };

  /**
   * Initialize TTS engine and get available voices
   */
  const initializeTTS = useCallback(async () => {
    try {
      console.log('🔊 Initializing Expo Speech...');
      
      // Get available voices
      const voices = await Speech.getAvailableVoicesAsync();
      console.log('📋 Available voices:', voices);
      setAvailableVoices(voices);

      // Run debugging in development mode
      if (__DEV__) {
        console.log('🔍 Voice Analysis:');
        console.log(`📊 Total voices: ${voices.length}`);
        
        // Group voices by language
        const languageGroups = voices.reduce((groups, voice) => {
          const lang = voice.language || 'unknown';
          if (!groups[lang]) groups[lang] = [];
          groups[lang].push(voice);
          return groups;
        }, {});
        
        console.log('🌐 Languages available:');
        Object.entries(languageGroups).forEach(([lang, voiceList]) => {
          console.log(`   ${lang}: ${voiceList.length} voices`);
        });

        // Check for target languages
        const targetLangs = ['en', 'ta', 'si'];
        targetLangs.forEach(lang => {
          const available = voices.some(v => v.language.toLowerCase().includes(lang));
          console.log(`   ${lang.toUpperCase()}: ${available ? '✅ Available' : '❌ Not Available'}`);
        });
      }

      // Check for Sinhala voice availability
      const sinhalaVoice = voices.find(voice => 
        voice.language.toLowerCase().includes('si') || 
        voice.language.toLowerCase().includes('sinhala')
      );
      
      if (!sinhalaVoice) {
        console.warn('⚠️  Sinhala voice not available on this device');
      }

      setIsInitialized(true);
      setError(null);
      console.log('✅ Expo Speech initialized successfully');
    } catch (err) {
      console.error('❌ TTS initialization failed:', err);
      setError(`TTS initialization failed: ${err.message}`);
    }
  }, []);

  /**
   * Main speak function
   * @param {string} text - Text to speak
   * @param {string} lang - Language code (optional)
   */
  const speak = useCallback(async (text, lang = null) => {
    try {
      if (!text || text.trim().length === 0) {
        setError('Please enter some text to speak');
        return;
      }

      // Stop current speech if speaking
      if (isSpeaking) {
        await stopSpeaking();
      }

      const targetLanguage = lang || currentLanguage;
      console.log(`🗣️  Speaking in ${targetLanguage}: "${text.substring(0, 50)}..."`);

      // Check if language is supported
      const langConfig = supportedLanguages[targetLanguage];
      if (!langConfig) {
        throw new Error(`Language ${targetLanguage} is not supported`);
      }

      // Check if voice is available for the language
      const voiceAvailable = availableVoices.some(voice => 
        voice.language.toLowerCase().includes(langConfig.code.toLowerCase()) ||
        voice.language.toLowerCase().includes(langConfig.fallback.toLowerCase())
      );

      if (!voiceAvailable) {
        // For Sinhala, show specific warning
        if (targetLanguage === 'si-LK') {
          setError('Sinhala voice is not available on this device. Please check your device TTS settings.');
          return;
        } else {
          console.warn(`⚠️  Voice for ${langConfig.name} not found, using default voice`);
        }
      }

      // Find the best voice for the language
      let selectedVoice = null;
      if (voiceAvailable) {
        selectedVoice = availableVoices.find(voice => 
          voice.language.toLowerCase().includes(langConfig.code.toLowerCase()) ||
          voice.language.toLowerCase().includes(langConfig.fallback.toLowerCase())
        );
      }

      // Set speaking state
      setIsSpeaking(true);
      setError(null);

      // Speak with options
      const options = {
        language: targetLanguage,
        pitch: speechPitch,
        rate: speechRate,
        voice: selectedVoice?.identifier,
        onStart: () => {
          console.log('🗣️ Speech started');
          setIsSpeaking(true);
        },
        onDone: () => {
          console.log('✅ Speech finished');
          setIsSpeaking(false);
        },
        onStopped: () => {
          console.log('⏹️ Speech stopped');
          setIsSpeaking(false);
        },
        onError: (error) => {
          console.error('❌ Speech error:', error);
          setIsSpeaking(false);
          setError(`Speaking failed: ${error.message || error}`);
        }
      };

      await Speech.speak(text, options);
      
    } catch (err) {
      console.error('❌ Speak error:', err);
      setError(`Speaking failed: ${err.message}`);
      setIsSpeaking(false);
    }
  }, [currentLanguage, isSpeaking, availableVoices, speechRate, speechPitch]);

  /**
   * Stop current speech
   */
  const stopSpeaking = useCallback(async () => {
    try {
      await Speech.stop();
      setIsSpeaking(false);
      console.log('⏹️ Speech stopped');
    } catch (err) {
      console.error('❌ Stop speaking error:', err);
      setError(`Stop failed: ${err.message}`);
    }
  }, []);

  /**
   * Update speech rate
   * @param {number} rate - Speech rate (0.1 to 2.0)
   */
  const setRate = useCallback((rate) => {
    try {
      const clampedRate = Math.max(0.1, Math.min(2.0, rate));
      setSpeechRate(clampedRate);
      console.log(`🔊 Speech rate set to: ${clampedRate}`);
    } catch (err) {
      console.error('❌ Set rate error:', err);
      setError(`Rate setting failed: ${err.message}`);
    }
  }, []);

  /**
   * Update speech pitch
   * @param {number} pitch - Speech pitch (0.5 to 2.0)
   */
  const setPitch = useCallback((pitch) => {
    try {
      const clampedPitch = Math.max(0.5, Math.min(2.0, pitch));
      setSpeechPitch(clampedPitch);
      console.log(`🔊 Speech pitch set to: ${clampedPitch}`);
    } catch (err) {
      console.error('❌ Set pitch error:', err);
      setError(`Pitch setting failed: ${err.message}`);
    }
  }, []);

  /**
   * Get voices for a specific language
   * @param {string} languageCode - Language code to filter voices
   */
  const getVoicesForLanguage = useCallback((languageCode) => {
    const langConfig = supportedLanguages[languageCode];
    if (!langConfig) return [];

    return availableVoices.filter(voice => 
      voice.language.toLowerCase().includes(langConfig.code.toLowerCase()) ||
      voice.language.toLowerCase().includes(langConfig.fallback.toLowerCase())
    );
  }, [availableVoices]);

  /**
   * Check if a language is available
   * @param {string} languageCode - Language code to check
   */
  const isLanguageAvailable = useCallback((languageCode) => {
    return getVoicesForLanguage(languageCode).length > 0;
  }, [getVoicesForLanguage]);

  /**
   * Check if TTS is currently speaking
   */
  const checkSpeakingStatus = useCallback(async () => {
    try {
      const speaking = await Speech.isSpeakingAsync();
      setIsSpeaking(speaking);
      return speaking;
    } catch (err) {
      console.error('❌ Error checking speaking status:', err);
      return false;
    }
  }, []);

  // Initialize TTS on mount
  useEffect(() => {
    initializeTTS();
    
    // Set up periodic status checking
    const statusInterval = setInterval(() => {
      checkSpeakingStatus();
    }, 1000);
    
    return () => {
      clearInterval(statusInterval);
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, [initializeTTS, checkSpeakingStatus]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isSpeaking) {
        Speech.stop();
      }
    };
  }, []);

  return {
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
    initializeTTS,
    checkSpeakingStatus,

    // Utilities
    getVoicesForLanguage,
    isLanguageAvailable,

    // Clear error
    clearError: () => setError(null)
  };
};

export default useTTS;