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
  StatusBar,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { registerLawyer } from "../../../service/lawyerService";

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
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(30);

  React.useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 8;
  };

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
      Alert.alert("Incomplete Form", "Please fill in all required fields.");
      return;
    }

    if (!validateEmail(email)) {
      Alert.alert("Invalid Email", "Please enter a valid email address.");
      return;
    }

    if (!validatePassword(password)) {
      Alert.alert("Weak Password", "Password must be at least 8 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert("Password Mismatch", "Passwords do not match.");
      return;
    }

    setIsLoading(true);

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

      Alert.alert(
        "Registration Successful! ✅", 
        "Your lawyer registration has been submitted successfully. You will receive a confirmation email shortly.",
        [{ text: "OK", style: "default" }]
      );

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
    } catch (error) {
      Alert.alert(
        "Registration Failed", 
        error.message || "Something went wrong. Please try again.",
        [{ text: "OK", style: "destructive" }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const InputField = ({ icon, ...props }) => (
    <View style={styles.inputContainer}>
      <View style={styles.inputIconContainer}>
        <Text style={styles.inputIcon}>{icon}</Text>
      </View>
      <TextInput
        style={styles.input}
        placeholderTextColor="#999"
        {...props}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        {/* Header */}
        <View style={styles.header}>
          <Animated.View 
            style={[
              styles.headerContent,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <Text style={styles.headerIcon}>⚖️</Text>
            <Text style={styles.title}>Join Our Legal Network</Text>
            <Text style={styles.subtitle}>
              Register as a verified lawyer and connect with clients who need your expertise
            </Text>
          </Animated.View>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          bounces={true}
        >
          <Animated.View 
            style={[
              styles.formContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Personal Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>👤 Personal Information</Text>
              
              <View style={styles.row}>
                <View style={styles.halfInput}>
                  <InputField
                    icon="📝"
                    placeholder="First Name"
                    value={firstName}
                    onChangeText={setFirstName}
                    autoCapitalize="words"
                  />
                </View>
                <View style={styles.halfInput}>
                  <InputField
                    icon="📝"
                    placeholder="Last Name"
                    value={lastName}
                    onChangeText={setLastName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <InputField
                icon="📧"
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
              />

              <InputField
                icon="📱"
                placeholder="Contact Number"
                keyboardType="phone-pad"
                value={contactNumber}
                onChangeText={setContactNumber}
              />
            </View>

            {/* Security Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🔐 Security</Text>
              
              <InputField
                icon="🔒"
                placeholder="Password (min 8 characters)"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />

              <InputField
                icon="🔒"
                placeholder="Confirm Password"
                secureTextEntry
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </View>

            {/* Professional Information Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🎓 Professional Details</Text>
              
              <InputField
                icon="🆔"
                placeholder="Bar License Number"
                value={licenseNumber}
                onChangeText={setLicenseNumber}
              />

              <View style={styles.pickerContainer}>
                <View style={styles.pickerIconContainer}>
                  <Text style={styles.pickerIcon}>⚖️</Text>
                </View>
                <View style={styles.pickerWrapper}>
                  <Text style={styles.pickerLabel}>Practice Area</Text>
                  <Picker
                    selectedValue={practiceArea}
                    style={styles.picker}
                    onValueChange={(itemValue) => setPracticeArea(itemValue)}
                  >
                    <Picker.Item label="Select Practice Area" value="" />
                    <Picker.Item label="Criminal Law" value="criminal" />
                    <Picker.Item label="Family Law" value="family" />
                    <Picker.Item label="Corporate Law" value="corporate" />
                    <Picker.Item label="Property Law" value="property" />
                    <Picker.Item label="Civil Litigation" value="civil" />
                    <Picker.Item label="Human Rights" value="human-rights" />
                    <Picker.Item label="Immigration Law" value="immigration" />
                  </Picker>
                </View>
              </View>

              <InputField
                icon="📅"
                placeholder="Years of Experience"
                keyboardType="numeric"
                value={experience}
                onChangeText={setExperience}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              <Text style={styles.submitText}>
                {isLoading ? "Registering..." : "Submit Registration ✨"}
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By registering, you agree to our Terms of Service and Privacy Policy
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#1a237e",
  },
  container: {
    flex: 1,
  },
  header: {
    backgroundColor: "#1a237e",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 30,
  },
  headerContent: {
    alignItems: "center",
  },
  headerIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#e8eaf6",
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.9,
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollContent: {
    paddingBottom: 30,
    minHeight: "100%",
  },
  formContainer: {
    backgroundColor: "#f8f9fa",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingTop: 30,
    flexGrow: 1,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1a237e",
    marginBottom: 20,
    paddingLeft: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  halfInput: {
    width: "48%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  inputIconContainer: {
    width: 50,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  inputIcon: {
    fontSize: 18,
  },
  input: {
    flex: 1,
    height: 55,
    paddingHorizontal: 15,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 15,
    marginBottom: 15,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  pickerIconContainer: {
    width: 50,
    height: 55,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f1f3f4",
    borderTopLeftRadius: 15,
    borderBottomLeftRadius: 15,
  },
  pickerIcon: {
    fontSize: 18,
  },
  pickerWrapper: {
    flex: 1,
    paddingHorizontal: 15,
  },
  pickerLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: -5,
    marginTop: 8,
  },
  picker: {
    height: 50,
    color: "#333",
  },
  submitButton: {
    backgroundColor: "#1a237e",
    paddingVertical: 18,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 10,
    elevation: 3,
    shadowColor: "#1a237e",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    backgroundColor: "#9e9e9e",
    elevation: 0,
    shadowOpacity: 0,
  },
  submitText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  footer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    lineHeight: 18,
  },
});