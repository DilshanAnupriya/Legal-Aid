import React from 'react';
import { Text, TextProps, Platform } from 'react-native';

/**
 * UnicodeText component that properly renders Sinhala, Tamil, and other Unicode characters
 * 
 * This component ensures proper rendering of:
 * - Sinhala (සිංහල) - U+0D80 to U+0DFF
 * - Tamil (தமிழ்) - U+0B80 to U+0BFF
 * - Other Unicode characters
 */
interface UnicodeTextProps extends TextProps {
  children?: React.ReactNode;
}

export const UnicodeText: React.FC<UnicodeTextProps> = ({ style, children, ...props }) => {
  // Platform-specific styles for better Unicode rendering
  const unicodeStyle = Platform.select({
    ios: {
      fontFamily: 'System',
      // iOS handles Unicode well by default
    },
    android: {
      fontFamily: 'sans-serif',
      textAlignVertical: 'center' as const,
      // Android needs these for proper Unicode rendering
    },
    web: {
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Noto Sans", sans-serif',
      // Web fonts that support Sinhala and Tamil
    },
    default: {
      fontFamily: 'System',
    },
  });

  return (
    <Text
      {...props}
      style={[unicodeStyle, style]}
      allowFontScaling={true}
    >
      {children}
    </Text>
  );
};

export default UnicodeText;
