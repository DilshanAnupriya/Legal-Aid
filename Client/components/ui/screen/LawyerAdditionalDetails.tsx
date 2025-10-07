import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { COLOR } from "@/constants/ColorPallet";
import { saveLawyerProfile, getLawyerProfile } from "../../../service/lawyerService";
import { useAuth } from "@/context/AuthContext";

export default function LawyerAdditionalDetails() {
  const { user } = useAuth(); // get logged-in user
  const lawyerId = user?.id; // assuming user object has _id
  const [profile, setProfile] = useState({
    experience: 0,
    aboutMe: "",
    contactInfo: {
      email: "",
      phone: "",
      officeLocation: "",
      languages: [],
    },
  });

  const [isLoading, setIsLoading] = useState(false);

  // Fetch profile for logged-in lawyer
  useEffect(() => {
  const fetchProfile = async () => {
    if (!lawyerId) return;
    try {
      setIsLoading(true);
      const data = await getLawyerProfile(lawyerId);

      if (data) {
        // Ensure contactInfo exists
        setProfile({
          experience: data.experience || 0,
          aboutMe: data.aboutMe || "",
          contactInfo: {
            email: data.contactInfo?.email || "",
            phone: data.contactInfo?.phone || "",
            officeLocation: data.contactInfo?.officeLocation || "",
            languages: data.contactInfo?.languages || [],
          },
        });
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to fetch profile");
    } finally {
      setIsLoading(false);
    }
  };

  fetchProfile();
}, [lawyerId]);

  const handleSave = async () => {
    if (!profile.contactInfo.email || !profile.contactInfo.phone) {
      Alert.alert("Error", "Email and phone are required.");
      return;
    }

    console.log("lawyer id : ", lawyerId)

    try {
      setIsLoading(true);
      await saveLawyerProfile(lawyerId, profile);
      Alert.alert("Success", "Profile saved successfully.");
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save profile.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    if (field.startsWith("contactInfo.")) {
      const key = field.split(".")[1];
      setProfile((prev) => ({
        ...prev,
        contactInfo: { ...prev.contactInfo, [key]: value },
      }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value }));
    }
  };

  const toggleLanguage = (lang) => {
    setProfile((prev) => {
      const exists = prev.contactInfo.languages.includes(lang);
      const newLangs = exists
        ? prev.contactInfo.languages.filter((l) => l !== lang)
        : [...prev.contactInfo.languages, lang];
      return { ...prev, contactInfo: { ...prev.contactInfo, languages: newLangs } };
    });
  };

  const languageOptions = ["English", "Sinhala", "Tamil"];

  return (
    <ScrollView style={styles.container}>
      {isLoading && <ActivityIndicator size="large" color={COLOR.light.primary} />}

      {/* About Me */}
      <View style={styles.field}>
        <Text style={styles.label}>About Me</Text>
        <TextInput
          style={styles.input}
          placeholder="Tell us about yourself"
          value={profile.aboutMe}
          onChangeText={(text) => handleChange("aboutMe", text)}
          multiline
        />
      </View>

      {/* Experience */}
      <View style={styles.field}>
        <Text style={styles.label}>Experience (Years)</Text>
        <TextInput
          style={styles.input}
          placeholder="0"
          keyboardType="numeric"
          value={profile.experience?.toString()}
          onChangeText={(text) => handleChange("experience", Number(text))}
        />
      </View>

      {/* Contact Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Contact Information</Text>

        <View style={styles.field}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="Email"
            keyboardType="email-address"
            value={profile.contactInfo.email}
            onChangeText={(text) => handleChange("contactInfo.email", text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Phone *</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone"
            keyboardType="phone-pad"
            value={profile.contactInfo.phone}
            onChangeText={(text) => handleChange("contactInfo.phone", text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Office Location</Text>
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={profile.contactInfo.officeLocation}
            onChangeText={(text) => handleChange("contactInfo.officeLocation", text)}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Languages</Text>
          <View style={styles.languagesContainer}>
            {languageOptions.map((lang) => (
              <TouchableOpacity
                key={lang}
                style={[
                  styles.languageButton,
                  profile.contactInfo.languages.includes(lang) && styles.languageSelected,
                ]}
                onPress={() => toggleLanguage(lang)}
              >
                <Text
                  style={[
                    styles.languageText,
                    profile.contactInfo.languages.includes(lang) && styles.languageTextSelected,
                  ]}
                >
                  {lang}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>

      <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
        <Text style={styles.saveButtonText}>Save Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLOR.light.light },
  section: { marginTop: 20, padding: 10, backgroundColor: "#fff", borderRadius: 12 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  field: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#F8F9FA",
  },
  languagesContainer: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  languageButton: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 8,
  },
  languageSelected: { backgroundColor: COLOR.light.primary, borderColor: COLOR.light.primary },
  languageText: { color: "#666" },
  languageTextSelected: { color: "#fff", fontWeight: "600" },
  saveButton: {
    marginTop: 20,
    backgroundColor: COLOR.light.primary,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
});
