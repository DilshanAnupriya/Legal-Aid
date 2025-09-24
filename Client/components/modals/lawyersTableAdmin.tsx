import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as adminService from "../../service/adminService";

export default function LawyersListAdmin() {
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const lawyersData = await adminService.getAllLawyers();
      setLawyers(lawyersData);
    } catch (error) {
      console.error("Error fetching lawyers:", error.message || error);
      Alert.alert("Error", "Failed to fetch lawyers");
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (lawyerId, currentStatus) => {
    try {
      await adminService.updateLawyerApproval(lawyerId, !currentStatus);
      setLawyers((prev) =>
        prev.map((l) =>
          l._id === lawyerId ? { ...l, isApproved: !currentStatus } : l
        )
      );
    } catch (error) {
      console.error("Error updating approval:", error.message || error);
      Alert.alert("Error", "Failed to update approval");
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {item.firstName} {item.lastName}
      </Text>
      <Text style={styles.info}>Email: {item.email}</Text>
      <Text style={styles.info}>Specialization: {item.specialization}</Text>
      <Text style={styles.info}>Contact: {item.contactNumber}</Text>
      <Text style={styles.info}>License: {item.licenseNumber}</Text>
      <Text style={styles.info}>Experience: {item.experience} yrs</Text>

      <TouchableOpacity
        style={[
          styles.approveButton,
          { backgroundColor: item.isApproved ? "#4CAF50" : "#F44336" },
        ]}
        onPress={() => toggleApproval(item._id, item.isApproved)}
      >
        <Text style={styles.approveText}>
          {item.isApproved ? "Approved" : "Not Approved"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <FlatList
      data={lawyers}
      keyExtractor={(item) => item._id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 10, paddingBottom: 100 }}
    />
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    marginBottom: 3,
  },
  approveButton: {
    marginTop: 10,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: "center",
  },
  approveText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  loading: { flex: 1, justifyContent: "center", alignItems: "center" },
});
