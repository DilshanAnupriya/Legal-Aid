import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LawyerProfileAboutWidget({ bio }) {
  return (
    <View style={styles.aboutSection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>👤</Text>
        <Text style={styles.sectionTitle}>About Me</Text>
      </View>
      <Text style={styles.aboutText}>{bio}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  aboutSection: {
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
  aboutText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
});