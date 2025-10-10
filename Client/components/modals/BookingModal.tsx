// BookingModal.tsx
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Modal,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

interface BookingModalProps {
  visible: boolean;
  lawyer: any;
  onClose: () => void;
  onSubmit: (bookingData: BookingData) => void;
}

interface BookingData {
  lawyerId: string;
  date: Date;
  time: string;
  caseType: string;
  description: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  meetingType: "in-person" | "video" | "phone";
}

const BookingModal: React.FC<BookingModalProps> = ({
  visible,
  lawyer,
  onClose,
  onSubmit,
}) => {
  const { user } = useAuth();
  const { colors } = useTheme();

  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [time, setTime] = useState("09:00 AM");
  const [caseType, setCaseType] = useState("");
  const [description, setDescription] = useState("");
  const [contactName, setContactName] = useState(
    user?.firstName ? `${user.firstName} ${user.lastName}` : ""
  );
  const [contactEmail, setContactEmail] = useState(user?.email || "");
  const [contactPhone, setContactPhone] = useState(user?.contactNumber || "");
  const [meetingType, setMeetingType] = useState<
    "in-person" | "video" | "phone"
  >("video");

  const caseTypes = [
    "Criminal Defense",
    "Civil Litigation",
    "Family Law",
    "Corporate Law",
    "Property Law",
    "Employment Law",
    "Immigration",
    "Other",
  ];

  const timeSlots = [
    "09:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "01:00 PM",
    "02:00 PM",
    "03:00 PM",
    "04:00 PM",
    "05:00 PM",
  ];

  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === "ios");
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (
      !caseType ||
      !description ||
      !contactName ||
      !contactEmail ||
      !contactPhone
    ) {
      alert("Please fill in all required fields");
      return;
    }

    const bookingData: BookingData = {
      userId: user.id,
      lawyerId: lawyer?.id,
      date,
      time,
      caseType,
      description,
      contactName,
      contactEmail,
      contactPhone,
      meetingType,
    };

    onSubmit(bookingData);
    resetForm();
  };

  const resetForm = () => {
    setDate(new Date());
    setTime("09:00 AM");
    setCaseType("");
    setDescription("");
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setMeetingType("video");
  };

  if (!lawyer) return null;

  const fullName = `${lawyer?.firstName || ""} ${lawyer?.lastName || ""}`.trim();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={[styles.modalOverlay, { backgroundColor: "rgba(0,0,0,0.5)" }]}>
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: colors.white },
          ]}
        >
          {/* Header */}
          <View
            style={[
              styles.header,
              { borderBottomColor: colors.darkgray },
            ]}
          >
            <View>
              <Text style={[styles.headerTitle, { color: colors.primary }]}>
                Book Appointment
              </Text>
              <Text style={[styles.headerSubtitle, { color: colors.secondary }]}>
                with {fullName}
              </Text>
              <Text style={[styles.lawyerSpecialization, { color: colors.accent }]}>
                {lawyer?.specialization}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Date Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.primary }]}>
                Appointment Date *
              </Text>
              <TouchableOpacity
                style={[
                  styles.dateButton,
                  { backgroundColor: colors.light, borderColor: colors.darkgray },
                ]}
                onPress={() => setShowDatePicker(true)}
              >
                <MaterialIcons name="event" size={20} color={colors.accent} />
                <Text style={[styles.dateButtonText, { color: colors.primary }]}>
                  {date.toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </Text>
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  minimumDate={new Date()}
                  onChange={handleDateChange}
                />
              )}
            </View>

            {/* Time Selection */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.primary }]}>
                Preferred Time *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.timeSlotContainer}
              >
                {timeSlots.map((slot) => (
                  <TouchableOpacity
                    key={slot}
                    style={[
                      styles.timeSlot,
                      {
                        backgroundColor:
                          time === slot ? colors.accent : colors.light,
                        borderColor: time === slot ? colors.accent : colors.darkgray,
                      },
                    ]}
                    onPress={() => setTime(slot)}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        { color: time === slot ? colors.textcol : colors.primary },
                      ]}
                    >
                      {slot}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Meeting Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.primary }]}>
                Meeting Type *
              </Text>
              <View style={styles.meetingTypeContainer}>
                {["video", "in-person", "phone"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.meetingTypeButton,
                      {
                        backgroundColor:
                          meetingType === type ? colors.accent : colors.light,
                        borderColor: colors.darkgray,
                      },
                    ]}
                    onPress={() => setMeetingType(type as any)}
                  >
                    <Ionicons
                      name={type === "video" ? "videocam" : type === "in-person" ? "person" : "call"}
                      size={20}
                      color={meetingType === type ? colors.textcol : colors.accent}
                    />
                    <Text
                      style={[
                        styles.meetingTypeText,
                        {
                          color: meetingType === type ? colors.textcol : colors.accent,
                        },
                      ]}
                    >
                      {type === "video"
                        ? "Video"
                        : type === "in-person"
                        ? "In-Person"
                        : "Phone"}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Case Type */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.primary }]}>
                Case Type *
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.caseTypeContainer}
              >
                {caseTypes.map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.caseTypeChip,
                      {
                        backgroundColor:
                          caseType === type ? colors.accent : colors.light,
                        borderColor: colors.darkgray,
                      },
                    ]}
                    onPress={() => setCaseType(type)}
                  >
                    <Text
                      style={[
                        styles.caseTypeText,
                        { color: caseType === type ? colors.textcol : colors.primary },
                      ]}
                    >
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Description */}
            <View style={styles.section}>
              <Text style={[styles.label, { color: colors.primary }]}>
                Case Description *
              </Text>
              <TextInput
                style={[
                  styles.textArea,
                  {
                    backgroundColor: colors.light,
                    borderColor: colors.darkgray,
                    color: colors.primary,
                  },
                ]}
                placeholder="Please describe your legal matter..."
                placeholderTextColor={colors.darkgray}
                multiline
                numberOfLines={4}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            {/* Contact Information */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.primary }]}>
                Contact Information
              </Text>

              <Text style={[styles.label, { color: colors.primary }]}>Full Name *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.light,
                    borderColor: colors.darkgray,
                    color: colors.primary,
                  },
                ]}
                placeholder="Enter your full name"
                placeholderTextColor={colors.darkgray}
                value={contactName}
                onChangeText={setContactName}
              />

              <Text style={[styles.label, { color: colors.primary }]}>Email Address *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.light,
                    borderColor: colors.darkgray,
                    color: colors.primary,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.darkgray}
                keyboardType="email-address"
                autoCapitalize="none"
                value={contactEmail}
                onChangeText={setContactEmail}
              />

              <Text style={[styles.label, { color: colors.primary }]}>Phone Number *</Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.light,
                    borderColor: colors.darkgray,
                    color: colors.primary,
                  },
                ]}
                placeholder="Enter your phone number"
                placeholderTextColor={colors.darkgray}
                keyboardType="phone-pad"
                value={contactPhone}
                onChangeText={setContactPhone}
              />
            </View>

            {/* Note */}
            <View
              style={[
                styles.noteContainer,
                { backgroundColor: colors.blue + "20" }, // light translucent
              ]}
            >
              <Ionicons name="information-circle" size={20} color={colors.blue} />
              <Text style={[styles.noteText, { color: colors.blue }]}>
                Your appointment request will be reviewed by the lawyer. You'll
                receive a confirmation via email.
              </Text>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={[
                styles.cancelButton,
                { backgroundColor: colors.light, borderColor: colors.darkgray },
              ]}
              onPress={onClose}
            >
              <Text style={[styles.cancelButtonText, { color: colors.secondary }]}>
                Cancel
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.submitButton,
                {
                  backgroundColor: colors.accent,
                  shadowColor: colors.shadow,
                },
              ]}
              onPress={handleSubmit}
            >
              <MaterialIcons name="event-available" size={20} color={colors.textcol} />
              <Text style={[styles.submitButtonText, { color: colors.textcol }]}>
                Book Appointment
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};




const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1A1A1A",
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginTop: 4,
  },
  lawyerSpecialization: {
    fontSize: 14,
    color: "#007AFF",
    marginTop: 2,
    fontWeight: "500",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  dateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  dateButtonText: {
    fontSize: 15,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
  timeSlotContainer: {
    flexDirection: "row",
  },
  timeSlot: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
  },
  timeSlotSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  timeSlotText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  timeSlotTextSelected: {
    color: "#FFFFFF",
  },
  meetingTypeContainer: {
    flexDirection: "row",
    gap: 12,
  },
  meetingTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  meetingTypeSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  meetingTypeText: {
    fontSize: 13,
    color: "#007AFF",
    marginLeft: 6,
    fontWeight: "600",
  },
  meetingTypeTextSelected: {
    color: "#FFFFFF",
  },
  caseTypeContainer: {
    flexDirection: "row",
  },
  caseTypeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginRight: 8,
  },
  caseTypeChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  caseTypeText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  caseTypeTextSelected: {
    color: "#FFFFFF",
  },
  input: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginBottom: 16,
  },
  textArea: {
    backgroundColor: "#F8F9FA",
    padding: 16,
    borderRadius: 12,
    fontSize: 15,
    color: "#333",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    minHeight: 120,
    textAlignVertical: "top",
  },
  noteContainer: {
    flexDirection: "row",
    backgroundColor: "#E3F2FD",
    padding: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  noteText: {
    fontSize: 13,
    color: "#1976D2",
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#F8F9FA",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
  },
  submitButton: {
    flex: 2,
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

export default BookingModal;
