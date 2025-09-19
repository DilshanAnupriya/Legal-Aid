import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useTheme } from "../../context/ThemeContext";
import { getAllLawyers } from "../../service/lawyerService";
import LoadingOverlay from "@/components/ui/screen/widget/NgoScreen/LoadingOverlayWidget";
import CategoryFilter from "@/components/ui/screen/widget/NgoScreen/NgoCategoryFilterWidget";

export default function LawyerNetworkScreen() {
  const { colors } = useTheme();
  const styles = getStyles(colors);

  // State
  const [lawyers, setLawyers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");

  // Booking Modal State
  const [bookingVisible, setBookingVisible] = useState(false);
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [appointmentName, setAppointmentName] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [meetingType, setMeetingType] = useState("Call"); // default

  const categories = [
    "All",
    "Human Rights & Civil Liberties",
    "Women's Rights & Gender Justice",
    "Refugee & Migrant Rights",
    "LGBTQ+ Rights",
    "Criminal Law",
    "Education & Student Rights",
    "Consumer Rights",
  ];

  // Fetch Lawyers
  const fetchLawyers = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
      setPage(1);
    } else {
      setLoading(true);
    }

    try {
      

      const data = await getAllLawyers();
      if (data) {
        const filteredData = data.filter(
          (lawyer) =>
            lawyer.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
            lawyer.specialization
              .toLowerCase()
              .includes(searchText.toLowerCase()) ||
            lawyer.contactNumber.includes(searchText)
        );

        if (isRefresh || page === 1) {
          setLawyers(filteredData);
        } else {
          setLawyers((prev) => [...prev, ...filteredData]);
        }

        setHasNext(false);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to fetch lawyers. Please try again.");
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLawyers();
  }, [searchText, selectedCategory, page]);

  // Handlers
  const handleRefresh = () => fetchLawyers(true);
  const handleLoadMore = () => {
    if (hasNext && !loading) setPage((prev) => prev + 1);
  };
  const handleSearch = (text) => {
    setSearchText(text);
    setPage(1);
    setLawyers([]);
  };
  const handleClearSearch = () => handleSearch("");
  const handleCardPress = (lawyer) =>
    console.log("Lawyer pressed:", lawyer.firstName);

  // Booking Handlers
  const handleBookPress = (lawyer) => {
    setSelectedLawyer(lawyer);
    setBookingVisible(true);
  };

  const handleConfirmBooking = async () => {
    if (!appointmentName) {
      Alert.alert("Error", "Please enter your name.");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://YOUR_API_URL/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: "USER_ID_HERE", // replace with logged-in user ID
          lawyerId: selectedLawyer._id,
          date: appointmentDate.toISOString(),
          time: appointmentDate.toISOString(),
          meetingType,
          description: `Appointment booked by ${appointmentName}`,
        }),
      });
      const handleCategorySelect = (category: any) => {
        setSelectedCategory(category === "All" ? "" : category);
        setPage(1);
      };

      const data = await response.json();

      if (response.ok) {
        Alert.alert("Success", "Appointment booked successfully!");
        setBookingVisible(false);
        setAppointmentName("");
        setAppointmentDate(new Date());
        setMeetingType("Call");
        setSelectedLawyer(null);
      } else {
        Alert.alert("Error", data.message || "Booking failed");
      }
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "Server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const onChangeDate = (event, selectedDate) => {
    const currentDate = selectedDate || appointmentDate;
    setShowDatePicker(Platform.OS === "ios");
    setAppointmentDate(currentDate);
  };

  const renderLawyer = ({ item }) => (
    <TouchableOpacity style={styles.card}>
      <View style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.firstName}</Text>
        <Text style={styles.text}>{item.specialization}</Text>
        <Text style={styles.text}>📧 {item.email}</Text>
        <Text style={styles.text}>📞 {item.contactNumber}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.accent }]}
            onPress={() => handleBookPress(item)}
          >
            <Text style={[styles.buttonText, { color: colors.light }]}>
              Book
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <Text style={styles.header}>
        ⚖️ Legal Aid Lawyer Network{"\n"}Connect with verified lawyers for free
        legal assistance
      </Text>

      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.darkgray} />
        <TextInput
          placeholder="Search Lawyers by name, specialty, location"
          placeholderTextColor={colors.darkgray}
          style={styles.searchInput}
          value={searchText}
          onChangeText={handleSearch}
        />
        {searchText ? (
          <TouchableOpacity onPress={handleClearSearch}>
            <Ionicons name="close-circle" size={20} color={colors.darkgray} />
          </TouchableOpacity>
        ) : null}
      </View>

      <CategoryFilter
        categories={categories}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
      />

      <FlatList
        data={lawyers}
        renderItem={renderLawyer}
        keyExtractor={(item) => item._id}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
      />

      <LoadingOverlay
        visible={loading && page === 1}
        message="Loading lawyers..."
      />

      {/* Booking Modal */}
      <Modal visible={bookingVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              Book Appointment with {selectedLawyer?.firstName}
            </Text>

            <TextInput
              placeholder="Your Name"
              placeholderTextColor={colors.darkgray}
              style={styles.modalInput}
              value={appointmentName}
              onChangeText={setAppointmentName}
            />

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              style={styles.dateButton}
            >
              <Text style={styles.dateButtonText}>
                {appointmentDate.toLocaleString()}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={appointmentDate}
                mode="datetime"
                display="default"
                onChange={onChangeDate}
              />
            )}

            {/* Meeting Type Selection */}
            <View style={{ marginVertical: 10 }}>
              <Text style={{ color: colors.accent, marginBottom: 5 }}>
                Meeting Type
              </Text>
              <View
                style={{ flexDirection: "row", justifyContent: "space-around" }}
              >
                {["Call", "Physical", "Video Call"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={{
                      paddingVertical: 8,
                      paddingHorizontal: 12,
                      borderRadius: 8,
                      backgroundColor:
                        meetingType === type ? colors.accent : colors.secondary,
                    }}
                    onPress={() => setMeetingType(type)}
                  >
                    <Text
                      style={{
                        color:
                          meetingType === type ? colors.light : colors.accent,
                      }}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                marginTop: 20,
              }}
            >
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.secondary }]}
                onPress={() => setBookingVisible(false)}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.accent }]}
                onPress={handleConfirmBooking}
              >
                <Text style={[styles.buttonText, { color: colors.light }]}>
                  Confirm
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LoadingOverlay visible={loading} message="Booking appointment..." />
    </View>
  );
}

// Styles
const getStyles = (colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.light, padding: 10 },
    header: {
      fontSize: 16,
      fontWeight: "bold",
      textAlign: "center",
      marginVertical: 10,
      color: colors.accent,
    },
    searchBar: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.secondary,
      padding: 10,
      borderRadius: 20,
      marginVertical: 10,
      opacity: 0.8,
    },
    searchInput: { marginLeft: 10, flex: 1, color: colors.primary },
    card: {
      backgroundColor: colors.secondary,
      padding: 15,
      borderRadius: 12,
      marginBottom: 10,
      flexDirection: "row",
      alignItems: "flex-start",
      shadowColor: colors.shadow,
      shadowOpacity: 0.2,
      shadowRadius: 5,
      elevation: 3,
    },
    avatar: {
      width: 50,
      height: 50,
      backgroundColor: colors.darkgray,
      borderRadius: 25,
      marginRight: 15,
    },
    name: { fontWeight: "bold", fontSize: 16, color: colors.accent },
    text: { color: colors.textcol },
    buttonRow: { flexDirection: "row", marginTop: 10 },
    button: {
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginRight: 10,
    },
    buttonText: { color: colors.accent },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.5)",
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    modalContent: {
      width: "100%",
      backgroundColor: colors.light,
      borderRadius: 12,
      padding: 20,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: "bold",
      marginBottom: 15,
      color: colors.accent,
    },
    modalInput: {
      borderWidth: 1,
      borderColor: colors.darkgray,
      borderRadius: 8,
      padding: 10,
      marginBottom: 15,
      color: colors.primary,
    },
    dateButton: {
      borderWidth: 1,
      borderColor: colors.darkgray,
      borderRadius: 8,
      padding: 10,
      alignItems: "center",
    },
    dateButtonText: { color: colors.primary },
  });
