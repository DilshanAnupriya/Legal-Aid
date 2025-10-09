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

const AppointmentsSection = ({ onViewAll}) => {
  const { user } = useAuth();
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
      const result = await updateAppointmentStatus(appointmentId, newStatus);
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
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Recent Appointments</Text>

      {loading ? (
        <ActivityIndicator size="small" color="#007AFF" />
      ) : appointments.length === 0 ? (
        <Text style={styles.noDataText}>No recent appointments found.</Text>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.appointmentCard}>
              <View>
                <Text style={styles.clientName}>{item.contactName || "Client"}</Text>
                <Text style={styles.caseType}>{item.meetingType || "Consultation"}</Text>
                <Text style={styles.time}>
                  {new Date(item.date).toDateString()} – {item.time}
                </Text>
              </View>
              <View style={styles.statusButtons}>
                {item.status !== "Confirmed" && (
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: "#4CAF50" }]}
                    onPress={() => handleStatusChange(item._id, "Confirmed")}
                  >
                    <Text style={styles.statusText}>Confirm</Text>
                  </TouchableOpacity>
                )}
                {item.status !== "Cancelled" && (
                  <TouchableOpacity
                    style={[styles.statusButton, { backgroundColor: "#FF3B30" }]}
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
        <Text style={styles.viewAllText} 
        onPress={() => navigation.navigate("LawyerAppointmentsScreen")} >
          View All Appointments →
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default AppointmentsSection;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  appointmentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#F4F4F4",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  caseType: {
    color: "#777",
  },
  time: {
    fontSize: 12,
    color: "#999",
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
    color: "#007AFF",
    fontWeight: "500",
  },
  noDataText: {
    textAlign: "center",
    color: "#666",
    marginVertical: 10,
  },
});
