import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LawyerProfileSpecializationWidget({ specializations }) {
  return (
    <View style={styles.specializationSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>⚖️</Text>
        <Text style={styles.sectionTitle}>Areas of Specialization</Text>
      </View>
      
      {specializations.map((area, index) => (
        <View key={index} style={styles.specializationItem}>
          <Text style={styles.specializationTitle}>{area.title}</Text>
          <Text style={styles.specializationDescription}>{area.description}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  specializationSection: {
    backgroundColor: 'white',
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  specializationItem: {
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  specializationTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  specializationDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
});