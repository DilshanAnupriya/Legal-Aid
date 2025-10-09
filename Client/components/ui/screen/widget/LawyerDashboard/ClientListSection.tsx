import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';

const clients = [
  { id: '1', name: 'John Doe', type: 'Criminal Case', contact: '+94 771234567' },
  { id: '2', name: 'Amara Silva', type: 'Family Law', contact: '+94 702223456' },
];

const ClientListSection = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Client List</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.clientCard}>
            <View>
              <Text style={styles.clientName}>{item.name}</Text>
              <Text style={styles.caseType}>{item.type}</Text>
              <Text style={styles.contact}>{item.contact}</Text>
            </View>
            <TouchableOpacity style={styles.messageButton}>
              <Text style={styles.messageText}>Message</Text>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

export default ClientListSection;

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
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  clientName: { fontSize: 16, fontWeight: '600' },
  caseType: { color: '#777' },
  contact: { fontSize: 12, color: '#999' },
  messageButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  messageText: { color: '#fff', fontWeight: '600' },
});
