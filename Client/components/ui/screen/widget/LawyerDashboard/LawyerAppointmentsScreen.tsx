import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useAuth } from "../../../../../context/AuthContext";
import { getLawyerAppointments, updateAppointmentStatus } from "../../../../../service/appointmentSercive";
import { useNavigation } from "@react-navigation/native";

const STATUS_OPTIONS = ["All", "Pending", "Confirmed", "Cancelled", "Completed"];

const LawyerAppointmentsScreen = () => {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [appointments, setAppointments] = useState([]);
  const [filteredAppointments, setFilteredAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("All");

  const fetchAppointments = async () => {
    if (!user?.id) return;
    try {
      const data = await getLawyerAppointments(user.id);
      setAppointments(data);
      setFilteredAppointments(data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleStatusChange = async (appointmentId, currentStatus) => {
    let newStatus =
      currentStatus === "Pending"
        ? "Confirmed"
        : currentStatus === "Confirmed"
        ? "Completed"
        : currentStatus === "Cancelled"
        ? "Pending"
        : "Pending";

    Alert.alert(
      "Change Status",
      `Are you sure you want to mark this appointment as "${newStatus}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Yes",
          onPress: async () => {
            try {
              await updateAppointmentStatus(appointmentId, newStatus);
              fetchAppointments();
            } catch (error) {
              console.error("Error updating status:", error);
              Alert.alert("Error", "Failed to update appointment status");
            }
          },
        },
      ]
    );
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    filterAppointments(text, selectedStatus);
  };

  const filterAppointments = (query, status) => {
    let filtered = [...appointments];

    if (status !== "All") {
      filtered = filtered.filter((appt) => appt.status === status);
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(
        (appt) =>
          appt.contactName.toLowerCase().includes(lowerQuery) ||
          appt.meetingType.toLowerCase().includes(lowerQuery)
      );
    }

    setFilteredAppointments(filtered);
  };

  const handleStatusFilter = (status) => {
    setSelectedStatus(status);
    filterAppointments(searchQuery, status);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backButtonText}>← Back</Text>
      </TouchableOpacity>

      <Text style={styles.title}>All Appointments</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.searchInput}
        placeholder="Search by client or type..."
        value={searchQuery}
        onChangeText={handleSearch}
      />

      {/* Status Filters */}
      <View style={styles.filterContainer}>
        {STATUS_OPTIONS.map((status) => (
          <TouchableOpacity
            key={status}
            style={[
              styles.filterButton,
              selectedStatus === status && styles.activeFilter,
            ]}
            onPress={() => handleStatusFilter(status)}
          >
            <Text
              style={[
                styles.filterText,
                selectedStatus === status && styles.activeFilterText,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filteredAppointments.length === 0 ? (
        <Text style={styles.noData}>No appointments found.</Text>
      ) : (
        <FlatList
          data={filteredAppointments}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.clientName}>{item.contactName}</Text>
                <Text style={styles.details}>
                  {item.meetingType} • {new Date(item.date).toDateString()} at {item.time}
                </Text>
                <Text style={styles.details}>{item.contactEmail}</Text>
                <Text style={styles.details}>{item.contactPhone}</Text>
                <Text style={styles.details}>{item.description}</Text>
              </View>

              <TouchableOpacity
                style={[
                  styles.statusButton,
                  {
                    backgroundColor:
                      item.status === "Confirmed"
                        ? "#4CAF50"
                        : item.status === "Cancelled"
                        ? "#E53935"
                        : item.status === "Completed"
                        ? "#607D8B"
                        : "#FFA500",
                  },
                ]}
                onPress={() => handleStatusChange(item._id, item.status)}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default LawyerAppointmentsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
    padding: 16,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "600",
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 12,
    color: "#333",
  },
  searchInput: {
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 12,
  },
  filterButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#eee",
    marginRight: 6,
    marginBottom: 6,
  },
  activeFilter: {
    backgroundColor: "#007AFF",
  },
  filterText: {
    fontSize: 12,
    color: "#555",
  },
  activeFilterText: {
    color: "#fff",
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 2,
  },
  clientName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#222",
  },
  details: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
  },
  noData: {
    textAlign: "center",
    color: "#999",
    marginTop: 50,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
