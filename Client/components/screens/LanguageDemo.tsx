import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import LanguageSelector from '../LanguageSelector';

const LanguageDemo: React.FC = () => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeText}>{t('common.welcome')}</Text>
          <Text style={styles.subtitle}>
            {t('forum.title')}
          </Text>
        </View>

        {/* Language Selector */}
        <LanguageSelector />

        {/* Demo Content */}
        <View style={styles.demoSection}>
          <Text style={styles.sectionTitle}>{t('navigation.forum')}</Text>
          
          <View style={styles.demoCard}>
            <Text style={styles.cardTitle}>{t('forum.askQuestion')}</Text>
            <Text style={styles.cardDescription}>
              {t('forum.searchPlaceholder')}
            </Text>
          </View>

          <View style={styles.demoCard}>
            <Text style={styles.cardTitle}>{t('forum.addPoll')}</Text>
            <Text style={styles.cardDescription}>
              {t('poll.createPoll')}
            </Text>
          </View>

          <View style={styles.categoriesSection}>
            <Text style={styles.sectionTitle}>{t('forum.legalCategories')}</Text>
            <View style={styles.categoriesGrid}>
              <Text style={styles.categoryItem}>👨‍👩‍👧‍👦 {t('categories.familyLaw')}</Text>
              <Text style={styles.categoryItem}>🏠 {t('categories.propertyLaw')}</Text>
              <Text style={styles.categoryItem}>💼 {t('categories.employmentLaw')}</Text>
              <Text style={styles.categoryItem}>⚖️ {t('categories.civilLaw')}</Text>
              <Text style={styles.categoryItem}>🚔 {t('categories.criminalLaw')}</Text>
            </View>
          </View>

          <View style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>{t('common.actions', { defaultValue: 'Actions' })}</Text>
            <View style={styles.actionsGrid}>
              <Text style={styles.actionItem}>✏️ {t('common.edit')}</Text>
              <Text style={styles.actionItem}>🗑️ {t('common.delete')}</Text>
              <Text style={styles.actionItem}>💾 {t('common.save')}</Text>
              <Text style={styles.actionItem}>🔍 {t('common.search')}</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  scrollView: {
    flex: 1,
  },
  welcomeSection: {
    backgroundColor: '#667eea',
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
    fontFamily: 'NotoSans-Bold', // Fallback to system font if Noto not loaded
  },
  subtitle: {
    fontSize: 18,
    color: '#ffffff',
    opacity: 0.9,
    fontFamily: 'NotoSans-Regular',
  },
  demoSection: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 16,
    marginTop: 10,
    fontFamily: 'NotoSans-SemiBold',
  },
  demoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 4,
    fontFamily: 'NotoSans-SemiBold',
  },
  cardDescription: {
    fontSize: 14,
    color: '#7F8C8D',
    fontFamily: 'NotoSans-Regular',
  },
  categoriesSection: {
    marginTop: 20,
  },
  categoriesGrid: {
    gap: 8,
  },
  categoryItem: {
    fontSize: 16,
    color: '#2C3E50',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 4,
    fontFamily: 'NotoSans-Regular',
  },
  actionsSection: {
    marginTop: 20,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  actionItem: {
    fontSize: 14,
    color: '#667eea',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(102, 126, 234, 0.1)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(102, 126, 234, 0.3)',
    fontFamily: 'NotoSans-Regular',
  },
});

export default LanguageDemo;
