import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export default function LawyerProfileStatsWidget({
  experience,
  clientWinRate,
  responseTime,
  successRate
}) {
  const stats = [
    { label: 'Experience', value: experience, maxValue: 20 },
    { label: 'Client Win', value: clientWinRate, maxValue: 100 },
    { label: 'Response time', value: responseTime, maxValue: 100 },
    { label: 'Success rate', value: successRate, maxValue: 100 },
  ];

  const getBarWidth = (value, maxValue) => {
    return `${(value / maxValue) * 100}%`;
  };

  return (
    <View style={styles.statsSection}>
      <Text style={styles.sectionTitle}>Stats</Text>
      <View style={styles.statsGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statItem}>
            <Text style={styles.statLabel}>{stat.label}</Text>
            <View style={styles.statBar}>
              <View 
                style={[
                  styles.statFill, 
                  { width: getBarWidth(stat.value, stat.maxValue) }
                ]} 
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsSection: {
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  statsGrid: {
    gap: 15,
  },
  statItem: {
    marginBottom: 10,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  statBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  statFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 3,
  },
});