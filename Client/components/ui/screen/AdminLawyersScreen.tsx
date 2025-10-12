import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  SafeAreaView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "../../../constants/ColorPallet";

interface Lawyer {
  id: string;
  firstName: string;
  lastName: string;
  specialization: string;
  contactNumber: string;
  lawyerStatus: string;
  email: string;
  tier: string;
  totalPoints: number;
  rating: number;
}

const AdminManageLawyers = ({ navigation }: any) => {
  const [lawyers, setLawyers] = useState<Lawyer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLawyers();
  }, []);

  const fetchLawyers = async () => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const baseUrl = (await AsyncStorage.getItem("adminApiUrl")) || "http://localhost:3000/api/admin";

      const response = await fetch(`${baseUrl}/lawyers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setLawyers(data.lawyers);
      } else {
        Alert.alert("Error", data.message || "Failed to load lawyers");
      }
    } catch (err) {
      console.error("Error fetching lawyers:", err);
      Alert.alert("Error", "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const updateLawyerStatus = async (id: string, newStatus: string) => {
    try {
      const token = await AsyncStorage.getItem("adminToken");
      const baseUrl = (await AsyncStorage.getItem("adminApiUrl")) || "http://localhost:3000/api/admin";

      console.log("lawyer id : ", id)
      const response = await fetch(`${baseUrl}/lawyers/${id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ lawyerStatus: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", `Lawyer ${newStatus}`);
        fetchLawyers();
      } else {
        Alert.alert("Error", data.message || "Failed to update status");
      }
    } catch (err) {
      console.error("Error updating lawyer status:", err);
    }
  };

  const deleteLawyer = async (id: string) => {
    Alert.alert("Confirm", "Are you sure you want to delete this lawyer?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            const token = await AsyncStorage.getItem("adminToken");
            const baseUrl = (await AsyncStorage.getItem("adminApiUrl")) || "http://localhost:3000/api/admin";

            const response = await fetch(`${baseUrl}/lawyers/${id}`, {
              method: "DELETE",
              headers: { Authorization: `Bearer ${token}` },
            });

            const data = await response.json();

            if (response.ok) {
              Alert.alert("Deleted", "Lawyer removed successfully");
              fetchLawyers();
            } else {
              Alert.alert("Error", data.message || "Failed to delete lawyer");
            }
          } catch (err) {
            console.error("Error deleting lawyer:", err);
          }
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLOR.light.orange} />
        <Text style={styles.loadingText}>Loading Lawyers...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Ionicons name="briefcase-outline" size={28} color={COLOR.light.orange} />
          <Text style={styles.headerTitle}>Manage Lawyers</Text>
        </View>
        <TouchableOpacity onPress={fetchLawyers}>
          <Ionicons name="refresh" size={24} color={COLOR.light.orange} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {lawyers.length === 0 ? (
          <Text style={styles.noData}>No lawyers found</Text>
        ) : (
          lawyers.map((lawyer) => (
            <View key={lawyer._id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.name}>
                  {lawyer.firstName} {lawyer.lastName}
                </Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        lawyer.lawyerStatus === "accepted"
                          ? "#2ecc71"
                          : lawyer.lawyerStatus === "rejected"
                          ? "#e74c3c"
                          : "#f39c12",
                    },
                  ]}
                >
                  <Text style={styles.statusText}>{lawyer.lawyerStatus}</Text>
                </View>
              </View>

              <Text style={styles.detail}>Specialization: {lawyer.specialization}</Text>
              <Text style={styles.detail}>Contact: {lawyer.contactNumber}</Text>
              <Text style={styles.detail}>Email: {lawyer.email}</Text>
              <Text style={styles.detail}>Tier: {lawyer.tier}</Text>
              <Text style={styles.detail}>Points: {lawyer.totalPoints}</Text>
              <Text style={styles.detail}>Rating: ⭐ {lawyer.rating}</Text>

              <View style={styles.actions}>
                {lawyer.lawyerStatus !== "accepted" && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#2ecc71" }]}
                    onPress={() => updateLawyerStatus(lawyer.id, "accepted")}
                  >
                    <Ionicons name="checkmark-circle" size={18} color="#fff" />
                    <Text style={styles.actionText}>Accept</Text>
                  </TouchableOpacity>
                )}
                {lawyer.lawyerStatus !== "rejected" && (
                  <TouchableOpacity
                    style={[styles.actionButton, { backgroundColor: "#e74c3c" }]}
                    onPress={() => updateLawyerStatus(lawyer.id, "rejected")}
                  >
                    <Ionicons name="close-circle" size={18} color="#fff" />
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: "#7f8c8d" }]}
                  onPress={() => deleteLawyer(lawyer.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#fff" />
                  <Text style={styles.actionText}>Delete</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#fff",
    elevation: 2,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: "bold", color: "#333" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: { marginTop: 10, fontSize: 16, color: "#666" },
  content: { padding: 15 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    elevation: 2,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  name: { fontSize: 16, fontWeight: "bold", color: "#333" },
  detail: { fontSize: 14, color: "#555", marginTop: 4 },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  statusText: { color: "#fff", fontWeight: "bold", textTransform: "capitalize" },
  noData: { textAlign: "center", fontSize: 16, color: "#888", marginTop: 20 },
  actions: { flexDirection: "row", justifyContent: "space-around", marginTop: 10 },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  actionText: { color: "#fff", fontWeight: "600" },
});

export default AdminManageLawyers;
