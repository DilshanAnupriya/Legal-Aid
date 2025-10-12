import React, { useEffect, useState } from "react";
import { View, TextInput, TouchableOpacity, Text, FlatList, StyleSheet } from "react-native";
import io from "socket.io-client";
import axios from "axios";

const socket = io("http://10.4.2.1:3000");

export default function ChatScreen({ route }) {
  const { chatId, senderId } = route?.params || {}; 
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  if (!chatId || !senderId) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No chat selected.</Text>
      </View>
    );
  }

  useEffect(() => {
    socket.emit("joinChat", chatId);

    socket.on("receiveMessage", (message) => {
      setMessages((prev) => [...prev, message]);
    });

    return () => socket.off("receiveMessage");
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    const message = { chatId, senderId, text };
    await axios.post("http://YOUR_SERVER_IP:5000/api/message", message);
    socket.emit("sendMessage", message);
    setText("");
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        renderItem={({ item }) => (
          <Text style={item.senderId === senderId ? styles.sent : styles.received}>
            {item.text}
          </Text>
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type message..."
          value={text}
          onChangeText={setText}
        />
        <TouchableOpacity onPress={sendMessage}>
          <Text style={styles.sendBtn}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 10 },
  inputContainer: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 8, padding: 10 },
  sendBtn: { marginLeft: 10, color: "blue", fontWeight: "bold" },
  sent: { alignSelf: "flex-end", backgroundColor: "#DCF8C6", padding: 8, borderRadius: 10, marginVertical: 3 },
  received: { alignSelf: "flex-start", backgroundColor: "#ECECEC", padding: 8, borderRadius: 10, marginVertical: 3 },
});
