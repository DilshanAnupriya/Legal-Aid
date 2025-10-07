import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AnalyticsSection = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Analytics Overview</Text>
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>12</Text>
          <Text style={styles.statLabel}>Users Helped</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>8h</Text>
          <Text style={styles.statLabel}>Hours Volunteered</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>5</Text>
          <Text style={styles.statLabel}>Cases Resolved</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>Family Law</Text>
          <Text style={styles.statLabel}>Top Category</Text>
        </View>
      </View>
    </View>
  );
};

export default AnalyticsSection;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '47%',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#222',
  },
  statLabel: {
    fontSize: 12,
    color: '#777',
  },
});
