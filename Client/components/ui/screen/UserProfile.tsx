import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to your Profile!</Text>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate("LawyerRegistrationForm")}
      >
        <Text style={styles.linkText}>Request to be a lawyer</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkContainer}
        onPress={() => navigation.navigate("LawyersTableAdmin")}
      >
        <Text style={styles.linkText}>admin</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 20, fontWeight: "bold", marginBottom: 20 },
  linkContainer: {
    marginTop: 10,
    padding: 10,
  },
  linkText: {
    color: "blue",
    fontSize: 16,
    textDecorationLine: "underline",
  },
});
