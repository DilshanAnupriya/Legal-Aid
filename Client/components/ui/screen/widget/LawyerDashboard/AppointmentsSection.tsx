import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getRecentAppointmentsForLawyer, updateAppointmentStatus } from "../../../../../service/appointmentSercive";
import { useAuth } from "../../../../../context/AuthContext";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../../../../../context/ThemeContext";

const AppointmentsSection = ({ onViewAll }) => {
  const { user } = useAuth();
  const { colors } = useTheme();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!user?.id) return;
      try {
        const data = await getRecentAppointmentsForLawyer(user.id);
        setAppointments(data);
      } catch (error) {
        console.error("Error fetching recent appointments:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchAppointments();
  }, [user]);

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await updateAppointmentStatus(appointmentId, newStatus);
      setAppointments((prev) =>
        prev.map((appt) =>
          appt._id === appointmentId ? { ...appt, status: newStatus } : appt
        )
      );
      Alert.alert("Success", `Status updated to ${newStatus}`);
    } catch (error) {
      console.error("Error updating status:", error);
      Alert.alert("Error", "Failed to update appointment status");
    }
  };

  return (
    <View style={[styles.card, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Recent Appointments</Text>

      {loading ? (
        <ActivityIndicator size="small" color={colors.accent} />
      ) : appointments.length === 0 ? (
        <Text style={[styles.noDataText, { color: colors.secondary }]}>No recent appointments found.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={[styles.appointmentCard, { backgroundColor: colors.light }]}>
              <View>
                <Text style={[styles.clientName, { color: colors.primary }]}>{item.contactName || "Client"}</Text>
                <Text style={[styles.caseType, { color: colors.secondary }]}>{item.meetingType || "Consultation"}</Text>
                <Text style={[styles.time, { color: colors.secondary }]}>
                  {new Date(item.date).toDateString()} – {item.time}
                </Text>
              </View>
              <View style={styles.statusButtons}>
                {item.status !== "Confirmed" && (
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: colors.success }]}
                    onPress={() => handleStatusChange(item._id, "Confirmed")}
                  >
                    <Text style={[styles.statusText]}>Confirm</Text>
                  </TouchableOpacity>
                )}
                {item.status !== "Cancelled" && (
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: colors.danger }]}
                    onPress={() => handleStatusChange(item._id, "Cancelled")}
                  >
                    <Text style={styles.statusText}>Cancel</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity style={styles.viewAll} onPress={onViewAll}>
        <Text
          style={[styles.viewAllText, { color: colors.accent }]}
          onPress={() => navigation.navigate("LawyerAppointmentsScreen")}
        >
          View All Appointments →
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppointmentsSection;

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
    fontWeight: "600",
    marginBottom: 12,
  },
  appointmentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
  },
  caseType: {
    fontSize: 13,
  },
  time: {
    fontSize: 12,
  },
  statusButtons: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginVertical: 4,
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
  },
  viewAll: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  viewAllText: {
    fontWeight: "500",
  },
  noDataText: {
    textAlign: "center",
    marginVertical: 10,
  },
});
