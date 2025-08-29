import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../context/ThemeContext";
import { getAllLawyers } from "../../services/lawyerService"; 

export default function LawyerNetworkScreen() {
  const { colors } = useTheme(); // from context
  const styles = getStyles(colors);

  const [search, setSearch] = useState("");
  const [lawyers, setLawyers] = useState([]); // 👈 state from API
  const [loading, setLoading] = useState(true);

  // Chat state
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello Lawyer", sender: "user" },
    { id: 2, text: "Hi, how can I help you?", sender: "lawyer" },
  ]);
  const [input, setInput] = useState("");

  // Fetch lawyers from backend
  useEffect(() => {
    const fetchLawyers = async () => {
      try {
        const data = await getAllLawyers();
        setLawyers(data);
      } catch (error) {
        console.error("Error loading lawyers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLawyers();
  }, []);

  const sendMessage = () => {
    if (input.trim()) {
      setMessages([
        ...messages,
        { id: Date.now(), text: input, sender: "user" },
      ]);
      setInput("");
    }
  };

  const renderLawyer = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.avatar} />
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{item.fullName}</Text>
        <Text style={styles.text}>{item.specialization}</Text>
        <Text style={styles.text}>📧 {item.email}</Text>
        <Text style={styles.text}>📞 {item.contactNumber}</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.button}>
            <Text style={styles.buttonText}>Book</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>
        ⚖️ Legal Aid Lawyer Network{"\n"}Connect with verified lawyers for free
        legal assistance
      </Text>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search" size={20} color={colors.darkgray} />
        <TextInput
          placeholder="Search Lawyers by name, specialty, location"
          placeholderTextColor={colors.darkgray}
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Lawyer List */}
      {loading ? (
        <Text style={{ textAlign: "center", marginVertical: 20 }}>
          Loading lawyers...
        </Text>
      ) : (
        <FlatList
          data={lawyers.filter(
            (lawyer) =>
              lawyer.firstName.toLowerCase().includes(search.toLowerCase()) ||
              lawyer.specialization
                .toLowerCase()
                .includes(search.toLowerCase()) ||
              lawyer.contactNumber.includes(search)
          )}
          renderItem={renderLawyer}
          keyExtractor={(item) => item._id}
        />
      )}

      {/* Anonymous Chat */}
      <View style={styles.chatBox}>
        <Text style={styles.chatHeader}>Anonymous Chat</Text>
        <ScrollView style={styles.messages}>
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.message,
                msg.sender === "user"
                  ? styles.userMessage
                  : styles.lawyerMessage,
              ]}
            >
              <Text style={styles.messageText}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>
        <View style={styles.inputRow}>
          <TextInput
            placeholder="Type your message.."
            placeholderTextColor={colors.darkgray}
            style={styles.chatInput}
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
            <Text style={{ color: colors.white }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

// Theme-aware styles (same as before)
const getStyles = (colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.light,
      padding: 10,
    },
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
      backgroundColor: colors.secondary,
      paddingVertical: 8,
      paddingHorizontal: 20,
      borderRadius: 8,
      marginRight: 10,
    },
    buttonText: { color: colors.accent },
    chatBox: {
      backgroundColor: colors.white,
      borderRadius: 10,
      padding: 10,
      marginTop: 15,
    },
    chatHeader: { fontWeight: "bold", marginBottom: 5, color: colors.primary },
    messages: { maxHeight: 200 },
    message: {
      padding: 10,
      marginVertical: 5,
      borderRadius: 8,
      maxWidth: "75%",
    },
    userMessage: { backgroundColor: colors.primary, alignSelf: "flex-end" },
    lawyerMessage: { backgroundColor: colors.darkgray, alignSelf: "flex-start" },
    messageText: { color: colors.white },
    inputRow: { flexDirection: "row", marginTop: 10, alignItems: "center" },
    chatInput: {
      flex: 1,
      backgroundColor: colors.white,
      borderRadius: 8,
      paddingHorizontal: 10,
      paddingVertical: 8,
      marginRight: 10,
      color: colors.primary,
    },
    sendButton: {
      backgroundColor: colors.accent,
      paddingVertical: 10,
      paddingHorizontal: 15,
      borderRadius: 8,
    },
  });
