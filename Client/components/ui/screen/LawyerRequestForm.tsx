import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Image,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Picker } from "@react-native-picker/picker";

export default function LawyerRequestForm() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [experience, setExperience] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const handleImagePick = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setProfileImage(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!fullName || !email || !password || !confirmPassword || !contactNumber || !licenseNumber || !practiceArea) {
      Alert.alert("Error", "Please fill in all required fields.");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match.");
      return;
    }
    Alert.alert("Success", "Lawyer registered successfully!");
    // Here you can call your backend API with the form data
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Lawyer Registration</Text>

      <TextInput
        style={styles.input}
        placeholder="Full Name"
        value={fullName}
        onChangeText={setFullName}
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
        placeholder="Bar Registration / License Number"
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
        placeholder="Years of Experience (Optional)"
        keyboardType="numeric"
        value={experience}
        onChangeText={setExperience}
      />

      <TouchableOpacity style={styles.imagePicker} onPress={handleImagePick}>
        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.image} />
        ) : (
          <Text style={styles.imageText}>Upload Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitText}>Register</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  label: {
    fontSize: 16,
    marginVertical: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  picker: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 12,
  },
  imagePicker: {
    alignItems: "center",
    justifyContent: "center",
    height: 150,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 20,
  },
  imageText: {
    color: "#666",
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  submitButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
