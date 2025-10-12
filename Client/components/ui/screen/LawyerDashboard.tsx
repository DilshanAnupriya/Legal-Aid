import React from 'react';
import { View, ScrollView, Text, StyleSheet } from 'react-native';
import AppointmentsSection from '@/components/ui/screen/widget/LawyerDashboard/AppointmentsSection';
import ClientListSection from '@/components/ui/screen/widget/LawyerDashboard/ClientListSection';
import FeedbackSection from '@/components/ui/screen/widget/LawyerDashboard/FeedbackSection';
import AnalyticsSection from '@/components/ui/screen/widget/LawyerDashboard/AnalyticsSection';
import TierProgressSection from './widget/LawyerDashboard/TierProgressSection';

function LawyerDashboard() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Lawyer Dashboard</Text>

      <TierProgressSection />
      <AnalyticsSection />
      <AppointmentsSection />
      <ClientListSection />
      <FeedbackSection />

      <View style={{ height: 50 }} /> 
    </ScrollView>
  );
}

export default LawyerDashboard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F9F9',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
});
