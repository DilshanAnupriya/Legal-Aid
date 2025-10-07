import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const mockAppointments = [
  { id: '1', user: 'John Doe', case: 'Property Dispute', time: 'Oct 10, 10:30 AM', status: 'Pending' },
  { id: '2', user: 'Sara Ali', case: 'Family Law', time: 'Oct 12, 02:00 PM', status: 'Confirmed' },
];

const AppointmentsSection = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Appointments</Text>
      <FlatList
        data={mockAppointments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.appointmentCard}>
            <View>
              <Text style={styles.clientName}>{item.user}</Text>
              <Text style={styles.caseType}>{item.case}</Text>
              <Text style={styles.time}>{item.time}</Text>
            </View>
            <TouchableOpacity style={[styles.statusButton, 
              { backgroundColor: item.status === 'Confirmed' ? '#4CAF50' : '#FFA500' }
            ]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity style={styles.viewAll}>
        <Text style={styles.viewAllText}>View All Appointments →</Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppointmentsSection;

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
  appointmentCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#222',
  },
  caseType: {
    color: '#777',
  },
  time: {
    fontSize: 12,
    color: '#999',
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
  },
  viewAll: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  viewAllText: {
    color: '#007AFF',
    fontWeight: '500',
  },
});
