import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from "../../../../../context/ThemeContext";
import { getClientsForLawyer } from "../../../../../service/appointmentSercive"; // ✅ import the new service
import { useAuth } from "../../../../../context/AuthContext"; // assuming you have lawyerId here

const ClientListSection = () => {
  const { colors } = useTheme();
  const { user } = useAuth(); // assuming `user._id` is lawyerId
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        if (!user?.id) return;
        const clientData = await getClientsForLawyer(user.id);
        setClients(clientData);
      } catch (error) {
        console.error("Failed to fetch clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, [user]);

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: colors.white }]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={{ color: colors.primary, marginTop: 8 }}>Loading clients...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Client List</Text>

      {clients.length === 0 ? (
        <Text style={{ color: colors.secondary }}>No clients found.</Text>
      ) : (
        <FlatList
          data={clients}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.clientCard, { backgroundColor: colors.light }]}>
              <View>
                <Text style={[styles.clientName, { color: colors.primary }]}>
                  {item.firstName} {item.lastName}
                </Text>
                <Text style={[styles.contact, { color: colors.tertiary }]}>
                  📧 {item.email || "No email"}
                </Text>
                <Text style={[styles.contact, { color: colors.tertiary }]}>
                  📞 {item.contactNumber || "No contact"}
                </Text>
              </View>
              <TouchableOpacity style={[styles.messageButton, { backgroundColor: colors.accent }]}>
                <Text style={[styles.messageText, { color: colors.white }]}>Message</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
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
  contact: { fontSize: 13, marginTop: 3 },
  messageButton: {
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    alignSelf: 'center',
  },
  messageText: { fontWeight: '600' },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    elevation: 3,
  },
});
