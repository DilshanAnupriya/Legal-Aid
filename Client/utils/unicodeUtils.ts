import { Platform, StyleSheet } from 'react-native';

/**
 * Utility functions for handling Unicode text display
 */

/**
 * Get appropriate font family for Unicode text based on platform and language
 * @param language - The language of the text (english, sinhala, tamil)
 * @returns Font family suitable for the language
 */
export const getUnicodeFontFamily = (language?: string): string => {
  if (Platform.OS === 'ios') {
    // iOS has good Unicode support with system fonts
    switch (language) {
      case 'sinhala':
        return 'System'; // iOS system font supports Sinhala
      case 'tamil':
        return 'System'; // iOS system font supports Tamil
      default:
        return 'System';
    }
  } else if (Platform.OS === 'android') {
    // Android font handling
    switch (language) {
      case 'sinhala':
        return 'sans-serif'; // Android's default sans-serif includes Unicode support
      case 'tamil':
        return 'sans-serif'; // Android's default sans-serif includes Unicode support
      default:
        return 'System';
    }
  } else {
    // Web platform
    switch (language) {
      case 'sinhala':
        return 'system-ui, "Noto Sans Sinhala", sans-serif';
      case 'tamil':
        return 'system-ui, "Noto Sans Tamil", sans-serif';
      default:
        return 'system-ui, sans-serif';
    }
  }
};

/**
 * Create text styles with proper Unicode font support
 * @param baseStyle - Base style object
 * @param language - Language for Unicode font selection
 * @returns Style object with Unicode font support
 */
export const createUnicodeTextStyle = (baseStyle: any, language?: string) => {
  return {
    ...baseStyle,
    fontFamily: getUnicodeFontFamily(language),
  };
};

/**
 * Check if text contains Unicode characters (non-ASCII)
 * @param text - Text to check
 * @returns True if text contains Unicode characters
 */
export const containsUnicode = (text: string): boolean => {
  return /[\u0080-\uFFFF]/.test(text);
};

/**
 * Detect probable language based on Unicode character ranges
 * @param text - Text to analyze
 * @returns Detected language or 'unknown'
 */
export const detectLanguage = (text: string): 'english' | 'sinhala' | 'tamil' | 'unknown' => {
  // Sinhala Unicode range: U+0D80–U+0DFF
  if (/[\u0D80-\u0DFF]/.test(text)) {
    return 'sinhala';
  }
  
  // Tamil Unicode range: U+0B80–U+0BFF
  if (/[\u0B80-\u0BFF]/.test(text)) {
    return 'tamil';
  }
  
  // If only ASCII characters, assume English
  if (!/[\u0080-\uFFFF]/.test(text)) {
    return 'english';
  }
  
  return 'unknown';
};

/**
 * Common Unicode text styles for the app
 */
export const unicodeTextStyles = StyleSheet.create({
  // Regular text styles
  bodyText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
  
  // Title styles
  titleText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  
  // Subtitle styles
  subtitleText: {
    fontSize: 14,
    color: '#666',
  },
  
  // Caption styles
  captionText: {
    fontSize: 12,
    color: '#999',
  },
  
  // Large text for better readability
  largeText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#333',
  },
});

/**
 * Apply Unicode styles to text based on language
 * @param style - Base style
 * @param text - Text content (used for language detection if language not provided)
 * @param language - Explicit language (optional)
 * @returns Complete style with Unicode support
 */
export const applyUnicodeStyle = (style: any, text?: string, language?: string) => {
  const detectedLanguage = language || (text ? detectLanguage(text) : 'english');
  
  return createUnicodeTextStyle(style, detectedLanguage);
};

export default {
  getUnicodeFontFamily,
  createUnicodeTextStyle,
  containsUnicode,
  detectLanguage,
  unicodeTextStyles,
  applyUnicodeStyle,
};