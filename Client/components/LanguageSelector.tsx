import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

const LanguageSelector: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  const languages = [
    { code: 'en', name: 'English', nativeName: 'English' },
    { code: 'si', name: 'Sinhala', nativeName: 'සිංහල' },
    { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  ];

  const changeLanguage = async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      Alert.alert(
        t('language.selectLanguage'),
        t('language.languageChanged')
      );
    } catch (error) {
      console.error('Error changing language:', error);
      Alert.alert('Error', 'Failed to change language');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('language.selectLanguage')}</Text>
      <View style={styles.buttonsContainer}>
        {languages.map((language) => (
          <TouchableOpacity
            key={language.code}
            style={[
              styles.languageButton,
              i18n.language === language.code && styles.activeButton,
            ]}
            onPress={() => changeLanguage(language.code)}>
            <Text
              style={[
                styles.buttonText,
                i18n.language === language.code && styles.activeButtonText,
              ]}>
              {language.nativeName}
            </Text>
            <Text
              style={[
                styles.buttonSubText,
                i18n.language === language.code && styles.activeButtonSubText,
              ]}>
              {language.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#ffffff',
    flexShrink: 0,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonsContainer: {
    flexDirection: 'column',
    gap: 12,
  },
  languageButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    fontFamily: 'NotoSans-Regular', // Fallback to system font if Noto not loaded
  },
  activeButtonText: {
    color: '#ffffff',
  },
  buttonSubText: {
    fontSize: 14,
    color: '#7F8C8D',
    marginTop: 4,
  },
  activeButtonSubText: {
    color: '#ffffff',
    opacity: 0.9,
  },
});

export default LanguageSelector;
