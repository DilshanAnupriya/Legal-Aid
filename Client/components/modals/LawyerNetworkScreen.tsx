import React, { useState } from "react";
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

// Dummy lawyer data
const lawyers = [
  {
    id: "1",
    name: "Advocate Anura Silva",
    specialty: "Family Law & Divorce",
    rating: 4.8,
    experience: 12,
    location: "Colombo",
  },
  {
    id: "2",
    name: "Nayani Kodikara",
    specialty: "Family Law & Divorce",
    rating: 4.0,
    experience: 10,
    location: "Kadawatha",
  },
];

export default function LawyerNetworkScreen() {
  const { colors, theme } = useTheme(); // from context
  const styles = getStyles(colors);

  const [search, setSearch] = useState("");
  const [messages, setMessages] = useState([
    { id: 1, text: "Hello Lawyer", sender: "user" },
    { id: 2, text: "Hi, how can I help you?", sender: "lawyer" },
  ]);
  const [input, setInput] = useState("");

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
        <Text style={styles.name}>{item.name}</Text>
        <Text style={styles.text}>{item.specialty}</Text>
        <Text style={styles.text}>⭐ {item.rating} / 5</Text>
        <Text style={styles.text}>
          Experience: {item.experience} years
        </Text>
        <Text style={styles.text}>Location: {item.location}</Text>
        <Text style={styles.text}>Anonymous Chat Available</Text>

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
      <FlatList
        data={lawyers}
        renderItem={renderLawyer}
        keyExtractor={(item) => item.id}
      />

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

// Theme-aware styles
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
