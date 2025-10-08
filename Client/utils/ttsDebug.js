import * as Speech from 'expo-speech';

/**
 * TTS Debug Utility for Expo Speech
 * Provides comprehensive debugging and voice listing functionality
 */
export class TTSDebug {
    /**
     * List all available voices on the device
     * @returns {Promise<Array>} Array of voice objects
     */
    static async listAllVoices() {
        try {
            const voices = await Speech.getAvailableVoicesAsync();
            console.log('🔊 === EXPO SPEECH DEBUGGING ===');
            console.log(`📋 Total voices found: ${voices.length}`);
            console.log('');
            
            // Group voices by language
            const voicesByLanguage = this.groupVoicesByLanguage(voices);
            
            // Log each language group
            Object.entries(voicesByLanguage).forEach(([language, languageVoices]) => {
                console.log(`🌐 Language: ${language}`);
                console.log(`   Voices: ${languageVoices.length}`);
                languageVoices.forEach((voice, index) => {
                    console.log(`   ${index + 1}. ${voice.name || 'Unknown'}`);
                    console.log(`      ID: ${voice.identifier || 'N/A'}`);
                    console.log(`      Language: ${voice.language}`);
                    console.log(`      Quality: ${voice.quality || 'Unknown'}`);
                    console.log('');
                });
            });
            
            console.log('🔊 === END EXPO SPEECH DEBUGGING ===');
            return voices;
        } catch (error) {
            console.error('❌ Error listing Expo Speech voices:', error);
            return [];
        }
    }

    /**
     * Group voices by language for better organization
     * @param {Array} voices - Array of voice objects
     * @returns {Object} Voices grouped by language
     */
    static groupVoicesByLanguage(voices) {
        return voices.reduce((groups, voice) => {
            const language = voice.language || 'unknown';
            if (!groups[language]) {
                groups[language] = [];
            }
            groups[language].push(voice);
            return groups;
        }, {});
    }

    /**
     * Check for specific language support
     * @param {Array} voices - Array of voice objects
     * @param {string} languageCode - Language code to check (e.g., 'en', 'ta', 'si')
     * @returns {Object} Language support information
     */
    static checkLanguageSupport(voices, languageCode) {
        const supportedVoices = voices.filter(voice => 
            voice.language.toLowerCase().includes(languageCode.toLowerCase())
        );

        const result = {
            isSupported: supportedVoices.length > 0,
            voiceCount: supportedVoices.length,
            voices: supportedVoices,
            highQuality: supportedVoices.filter(v => v.quality === 'enhanced' || v.quality === 'high').length
        };

        console.log(`🔍 Language Support Check: ${languageCode.toUpperCase()}`);
        console.log(`   Supported: ${result.isSupported ? '✅ Yes' : '❌ No'}`);
        console.log(`   Total voices: ${result.voiceCount}`);
        console.log(`   High quality voices: ${result.highQuality}`);

        return result;
    }

    /**
     * Generate comprehensive device TTS report
     * @returns {Promise<Object>} Complete TTS capabilities report
     */
    static async generateTTSReport() {
        try {
            console.log('📊 Generating Expo Speech Device Report...');
            
            const voices = await Speech.getAvailableVoicesAsync();
            const report = {
                timestamp: new Date().toISOString(),
                deviceInfo: {
                    totalVoices: voices.length,
                    platform: require('expo-constants').default.platform,
                },
                languages: {},
                recommendations: []
            };

            // Check support for target languages
            const targetLanguages = [
                { code: 'en', name: 'English', variants: ['en-US', 'en-GB', 'en-AU'] },
                { code: 'ta', name: 'Tamil', variants: ['ta-IN', 'ta-LK'] },
                { code: 'si', name: 'Sinhala', variants: ['si-LK'] }
            ];

            targetLanguages.forEach(lang => {
                const support = this.checkLanguageSupport(voices, lang.code);
                report.languages[lang.code] = {
                    name: lang.name,
                    supported: support.isSupported,
                    voiceCount: support.voiceCount,
                    highQualityVoices: support.highQuality,
                    variants: lang.variants
                };

                // Generate recommendations
                if (!support.isSupported) {
                    report.recommendations.push(`Install ${lang.name} language pack for better support`);
                } else if (support.highQuality === 0) {
                    report.recommendations.push(`Consider installing high quality ${lang.name} voices`);
                }
            });

            // Voice quality analysis
            const highQualityVoices = voices.filter(v => v.quality === 'high' || v.quality === 'enhanced');
            const enhancedVoices = voices.filter(v => v.quality === 'enhanced');

            report.quality = {
                highQuality: highQualityVoices.length,
                enhanced: enhancedVoices.length,
                percentageHighQuality: Math.round((highQualityVoices.length / voices.length) * 100),
                percentageEnhanced: Math.round((enhancedVoices.length / voices.length) * 100)
            };

            console.log('📊 === EXPO SPEECH DEVICE REPORT ===');
            console.log(`🕐 Generated: ${report.timestamp}`);
            console.log(`📱 Platform: ${report.deviceInfo.platform?.ios ? 'iOS' : 'Android'}`);
            console.log(`🔊 Total Voices: ${report.deviceInfo.totalVoices}`);
            console.log('');
            
            console.log('🌐 Language Support:');
            Object.entries(report.languages).forEach(([code, info]) => {
                console.log(`   ${info.name} (${code}): ${info.supported ? '✅' : '❌'} ${info.voiceCount} voices`);
            });
            console.log('');
            
            console.log('⚡ Voice Quality:');
            console.log(`   High Quality: ${report.quality.highQuality} (${report.quality.percentageHighQuality}%)`);
            console.log(`   Enhanced: ${report.quality.enhanced} (${report.quality.percentageEnhanced}%)`);
            console.log('');
            
            if (report.recommendations.length > 0) {
                console.log('💡 Recommendations:');
                report.recommendations.forEach((rec, index) => {
                    console.log(`   ${index + 1}. ${rec}`);
                });
            }
            
            console.log('📊 === END REPORT ===');
            
            return report;
        } catch (error) {
            console.error('❌ Error generating Expo Speech report:', error);
            return null;
        }
    }

    /**
     * Test TTS functionality with sample text
     * @param {string} text - Text to test with
     * @param {string} language - Language to test
     * @returns {Promise<boolean>} Success status
     */
    static async testTTS(text = 'Hello, this is a test', language = 'en-US') {
        try {
            console.log(`🧪 Testing Expo Speech with: "${text}" in ${language}`);
            
            const options = {
                language: language,
                pitch: 1.0,
                rate: 0.75,
                onStart: () => console.log('🗣️ Test speech started'),
                onDone: () => console.log('✅ Test speech completed'),
                onError: (error) => console.error('❌ Test speech failed:', error)
            };
            
            // Test speech
            await Speech.speak(text, options);
            
            console.log('✅ Expo Speech test initiated successfully');
            return true;
        } catch (error) {
            console.error('❌ Expo Speech test failed:', error);
            return false;
        }
    }

    /**
     * Initialize TTS debugging on app startup
     * Call this function when the app starts to get comprehensive debugging info
     */
    static async initializeDebugging() {
        console.log('🚀 Initializing Expo Speech Debugging...');
        
        try {
            // Check if speech is available
            const isAvailable = await Speech.isSpeakingAsync().catch(() => true); // If it errors, TTS is probably available
            console.log(`🔊 Expo Speech Available: ${isAvailable !== undefined ? '✅ Yes' : '❌ No'}`);
            
            // List all voices
            await this.listAllVoices();
            
            // Generate report
            await this.generateTTSReport();
            
            // Test basic functionality (optional, can be commented out to avoid unwanted speech)
            // console.log('🧪 Running basic TTS tests...');
            // await this.testTTS('Expo Speech initialization test', 'en-US');
            
            console.log('✅ Expo Speech Debugging initialization complete');
        } catch (error) {
            console.error('❌ Expo Speech Debugging initialization failed:', error);
        }
    }

    /**
     * Get voice recommendations for specific languages
     * @param {Array} voices - Available voices
     * @returns {Object} Recommended voices for each language
     */
    static getVoiceRecommendations(voices) {
        const recommendations = {
            'en-US': this.getBestVoiceForLanguage(voices, 'en'),
            'ta-IN': this.getBestVoiceForLanguage(voices, 'ta'),
            'si-LK': this.getBestVoiceForLanguage(voices, 'si')
        };

        console.log('🎯 Voice Recommendations:');
        Object.entries(recommendations).forEach(([lang, voice]) => {
            if (voice) {
                console.log(`   ${lang}: ${voice.name || voice.identifier} (Quality: ${voice.quality || 'Unknown'})`);
            } else {
                console.log(`   ${lang}: ❌ No suitable voice found`);
            }
        });

        return recommendations;
    }

    /**
     * Get the best voice for a specific language
     * @param {Array} voices - Available voices
     * @param {string} languageCode - Language code
     * @returns {Object|null} Best voice for the language
     */
    static getBestVoiceForLanguage(voices, languageCode) {
        const languageVoices = voices.filter(voice => 
            voice.language.toLowerCase().includes(languageCode.toLowerCase())
        );

        if (languageVoices.length === 0) return null;

        // Prioritize: enhanced > high > normal quality
        return languageVoices.sort((a, b) => {
            const aScore = this.calculateVoiceScore(a);
            const bScore = this.calculateVoiceScore(b);
            return bScore - aScore;
        })[0];
    }

    /**
     * Calculate voice quality score for ranking
     * @param {Object} voice - Voice object
     * @returns {number} Quality score
     */
    static calculateVoiceScore(voice) {
        let score = 0;
        
        // Quality bonus
        if (voice.quality === 'enhanced') score += 30;
        else if (voice.quality === 'high') score += 20;
        else if (voice.quality === 'normal') score += 10;
        
        // Prefer voices with names (usually system voices)
        if (voice.name) score += 5;
        
        return score;
    }

    /**
     * Check current speech status
     * @returns {Promise<boolean>} Whether TTS is currently speaking
     */
    static async checkSpeechStatus() {
        try {
            const speaking = await Speech.isSpeakingAsync();
            console.log(`🗣️ Currently Speaking: ${speaking ? 'Yes' : 'No'}`);
            return speaking;
        } catch (error) {
            console.error('❌ Error checking speech status:', error);
            return false;
        }
    }

    /**
     * Stop any current speech
     * @returns {Promise<void>}
     */
    static async stopSpeech() {
        try {
            await Speech.stop();
            console.log('⏹️ Speech stopped');
        } catch (error) {
            console.error('❌ Error stopping speech:', error);
        }
    }
}

export default TTSDebug;