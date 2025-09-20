import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function LawyerProfileAvailabilityWidget({ 
  availability, 
  onDaySelect 
}) {
  const [selectedDay, setSelectedDay] = useState(null);

  const handleDayPress = (index) => {
    if (availability[index].available) {
      setSelectedDay(index);
      onDaySelect && onDaySelect(index);
    }
  };

  return (
    <View style={styles.availabilitySection}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionIcon}>📅</Text>
        <Text style={styles.sectionTitle}>Availability This Week</Text>
      </View>
      
      <View style={styles.weekContainer}>
        {availability.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dayButton,
              !item.available && styles.unavailableDay,
              selectedDay === index && styles.selectedDay
            ]}
            onPress={() => handleDayPress(index)}
            disabled={!item.available}
          >
            <Text style={[
              styles.dayText,
              !item.available && styles.unavailableDayText,
              selectedDay === index && styles.selectedDayText
            ]}>
              {item.day}
            </Text>
            <Text style={[
              styles.dateText,
              !item.available && styles.unavailableDateText,
              selectedDay === index && styles.selectedDateText
            ]}>
              {item.date}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      
      <View style={styles.availabilityLegend}>
        <View style={styles.legendItem}>
          <View style={styles.availableDot} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={styles.busyDot} />
          <Text style={styles.legendText}>Busy</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  availabilitySection: {
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
  weekContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  dayButton: {
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    minWidth: 40,
    backgroundColor: '#f0f0f0',
  },
  selectedDay: {
    backgroundColor: '#4CAF50',
  },
  unavailableDay: {
    backgroundColor: '#e0e0e0',
  },
  dayText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
  },
  selectedDayText: {
    color: 'white',
  },
  unavailableDayText: {
    color: '#999',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 2,
  },
  selectedDateText: {
    color: 'white',
  },
  unavailableDateText: {
    color: '#999',
  },
  availabilityLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 20,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  availableDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
    marginRight: 5,
  },
  busyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginRight: 5,
  },
  legendText: {
    fontSize: 12,
    color: '#666',
  },
});