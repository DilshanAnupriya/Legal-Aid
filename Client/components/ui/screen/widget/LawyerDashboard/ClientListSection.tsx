import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { useTheme } from "../../../../../context/ThemeContext";

const clients = [
  { id: '1', name: 'John Doe', type: 'Criminal Case', contact: '+94 771234567' },
  { id: '2', name: 'Amara Silva', type: 'Family Law', contact: '+94 702223456' },
];

const ClientListSection = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Client List</Text>
      <FlatList
        data={clients}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[styles.clientCard, { backgroundColor: colors.light }]}>
            <View>
              <Text style={[styles.clientName, { color: colors.primary }]}>{item.name}</Text>
              <Text style={[styles.caseType, { color: colors.secondary }]}>{item.type}</Text>
              <Text style={[styles.contact, { color: colors.tertiary }]}>{item.contact}</Text>
            </View>
            <TouchableOpacity style={[styles.messageButton, { backgroundColor: colors.accent }]}>
              <Text style={[styles.messageText, { color: colors.white }]}>Message</Text>
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
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  clientCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  clientName: { fontSize: 16, fontWeight: '600' },
  caseType: { fontSize: 14 },
  contact: { fontSize: 12 },
  messageButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  messageText: { fontWeight: '600' },
});
