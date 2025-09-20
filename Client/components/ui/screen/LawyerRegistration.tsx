import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { registerLawyer } from "../../../service/lawyerService";
import { useTheme } from "../../../context/ThemeContext";

export default function LawyerRequestForm() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [experience, setExperience] = useState("");

  const { colors } = useTheme();

  const handleSubmit = async () => {
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !contactNumber ||
      !licenseNumber ||
      !practiceArea ||
      !experience
    ) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }

    try {
      const lawyerData = {
        firstName,
        lastName,
        email,
        password,
        contactNumber,
        licenseNumber,
        practiceArea,
        experience: Number(experience),
      };

      const response = await registerLawyer(lawyerData);

      Alert.alert("Success", `Lawyer registered! Token: ${response.token}`);

      // Reset form
      setFirstName("");
      setLastName("");
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setContactNumber("");
      setLicenseNumber("");
      setPracticeArea("");
      setExperience("");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Something went wrong");
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.light }]}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Lawyer Registration</Text>

          <View
            style={[
              styles.formBox,
              { backgroundColor: colors.white, shadowColor: colors.shadow },
            ]}
          >
            <TextInput
              style={styles.input}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />

            <TextInput
              style={styles.input}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />

            <TextInput
              style={styles.input}
              placeholder="Email"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            <TextInput
              style={styles.input}
              placeholder="Contact Number"
              keyboardType="phone-pad"
              value={contactNumber}
              onChangeText={setContactNumber}
            />
            <TextInput
              style={styles.input}
              placeholder="License Number"
              value={licenseNumber}
              onChangeText={setLicenseNumber}
            />

            <Text style={styles.label}>Practice Area</Text>
            <Picker
              selectedValue={practiceArea}
              style={styles.picker}
              onValueChange={(itemValue) => setPracticeArea(itemValue)}
            >
              <Picker.Item label="Select Area" value="" />
              <Picker.Item label="Criminal Law" value="criminal" />
              <Picker.Item label="Family Law" value="family" />
              <Picker.Item label="Corporate Law" value="corporate" />
              <Picker.Item label="Property Law" value="property" />
              <Picker.Item label="Civil Litigation" value="civil" />
            </Picker>

            <TextInput
              style={styles.input}
              placeholder="Years of Experience"
              keyboardType="numeric"
              value={experience}
              onChangeText={setExperience}
            />

            <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
              <Text style={styles.submitText}>Register</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // take full height
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 60, // ensures button is visible after scroll
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: { fontSize: 16, marginVertical: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    width: "100%",
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  submitText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  formBox: {
    flexDirection: "column",
    padding: 20,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
});
