import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from "../../../../../context/ThemeContext";

const AnalyticsSection = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.white }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>
        Analytics Overview
      </Text>
      <View style={styles.statsContainer}>
        <View style={[styles.statBox, { backgroundColor: colors.accent }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>12</Text>
          <Text style={[styles.statLabel, { color: colors.primary }]}>Users Helped</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.accent }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>8h</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Hours Volunteered</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.accent }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>5</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Cases Resolved</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.accent }]}>
          <Text style={[styles.statValue, { color: colors.primary }]}>Family Law</Text>
          <Text style={[styles.statLabel, { color: colors.secondary }]}>Top Category</Text>
        </View>
      </View>
    </View>
  );
};

export default AnalyticsSection;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statBox: {
    width: '47%',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 12,
    marginTop: 4,
  },
});
