import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  StatusBar,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../../context/ThemeContext';
import LanguageSelector from '../../LanguageSelector';

interface LanguageSettingsScreenProps {
  navigation?: any;
}

const LanguageSettingsScreen: React.FC<LanguageSettingsScreenProps> = ({ navigation }) => {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const styles = createStyles(colors);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={colors.primary} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation?.goBack()}
        >
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('language.selectLanguage')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('language.choosePreferredLanguage')}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.content} 
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={true}
        bounces={Platform.OS === 'ios'}
        overScrollMode="auto"
        nestedScrollEnabled={false}
      >
        {/* Language Selector */}
        <LanguageSelector />

        {/* Information Section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>{t('language.aboutLanguageSupport')}</Text>
          <Text style={styles.infoText}>
            {t('language.languageSupportDescription')}
          </Text>
          
          <View style={styles.featureList}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🌍</Text>
              <Text style={styles.featureText}>{t('language.fullAppTranslation')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>💾</Text>
              <Text style={styles.featureText}>{t('language.automaticPreferenceSaving')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>🔄</Text>
              <Text style={styles.featureText}>{t('language.instantLanguageSwitching')}</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>📱</Text>
              <Text style={styles.featureText}>{t('language.optimizedFonts')}</Text>
            </View>
          </View>
        </View>

        {/* Demo Section */}
        <View style={styles.demoSection}>
          <Text style={styles.demoTitle}>{t('language.sampleTranslations')}</Text>
          <View style={styles.demoGrid}>
            <View style={styles.demoCard}>
              <Text style={styles.demoLabel}>Welcome</Text>
              <Text style={styles.demoValue}>{t('common.welcome')}</Text>
            </View>
            <View style={styles.demoCard}>
              <Text style={styles.demoLabel}>Legal Forum</Text>
              <Text style={styles.demoValue}>{t('forum.title')}</Text>
            </View>
            <View style={styles.demoCard}>
              <Text style={styles.demoLabel}>Ask Question</Text>
              <Text style={styles.demoValue}>{t('forum.askQuestion')}</Text>
            </View>
            <View style={styles.demoCard}>
              <Text style={styles.demoLabel}>Family Law</Text>
              <Text style={styles.demoValue}>{t('categories.familyLaw')}</Text>
            </View>
          </View>
        </View>

        {/* Extra spacing at bottom */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const createStyles = (colors: any) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0,
    ...(Platform.OS === 'web' && {
      height: '100vh',
      maxHeight: '100vh',
      overflow: 'hidden',
    }),
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 0,
    ...(Platform.OS === 'web' && {
      position: 'sticky' as any,
      top: 0,
      zIndex: 10,
    }),
  },
  backButton: {
    marginRight: 15,
    padding: 5,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    marginRight: 35, // To center the text considering the back button
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
    fontFamily: 'NotoSans-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E8E8E8',
    fontFamily: 'NotoSans-Regular',
  },
  content: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    ...(Platform.OS === 'web' && {
      height: '100%',
      overflow: 'auto',
    }),
  },
  contentContainer: {
    paddingVertical: 20,
    paddingBottom: 100,
    ...(Platform.OS === 'web' && {
      minHeight: '100%',
      flexGrow: 1,
    }),
  },
  infoSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 12,
    fontFamily: 'NotoSans-SemiBold',
  },
  infoText: {
    fontSize: 14,
    color: '#7F8C8D',
    lineHeight: 20,
    marginBottom: 16,
    fontFamily: 'NotoSans-Regular',
  },
  featureList: {
    gap: 10,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  featureIcon: {
    fontSize: 16,
    marginRight: 10,
    width: 20,
  },
  featureText: {
    fontSize: 14,
    color: '#2C3E50',
    fontFamily: 'NotoSans-Regular',
  },
  demoSection: {
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    fontFamily: 'NotoSans-SemiBold',
  },
  demoGrid: {
    gap: 12,
  },
  demoCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 8,
    padding: 12,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },
  demoLabel: {
    fontSize: 12,
    color: '#7F8C8D',
    marginBottom: 4,
    fontFamily: 'NotoSans-Regular',
  },
  demoValue: {
    fontSize: 16,
    color: '#2C3E50',
    fontWeight: '500',
    fontFamily: 'NotoSans-Medium',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default LanguageSettingsScreen;
