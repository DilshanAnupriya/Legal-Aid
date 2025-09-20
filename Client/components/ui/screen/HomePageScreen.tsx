import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../../../context/ThemeContext";

const lawyer = require("../../../assets/images/pngtree-female-lawyer-png-image_14809305.png");
import { useNavigation } from "@react-navigation/native";

export default function HomePageScreen() {
  const { colors, theme } = useTheme(); // Get current theme colors and theme state
  const navigation = useNavigation();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.light }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Testimonial Section */}
        <View
          style={[
            styles.testimonialSection,
            {
              backgroundColor: colors.white,
              shadowColor: colors.shadow,
            },
          ]}
        >
          <View style={styles.testimonialContent}>
            <Text
              style={[
                styles.quoteIcon,
                { color: colors.accent, fontStyle: "italic" },
              ]}
            >
              "
            </Text>
            <Text
              style={[
                styles.testimonialText,
                { color: colors.primary, fontStyle: "italic" },
              ]}
            >
              We stand with communities{"\n"}who face inequality,{"\n"}giving
              them a voice{"\n"}and protecting their rights.
            </Text>
            <Text
              style={[
                styles.profileName,
                { color: colors.accent, fontStyle: "italic" },
              ]}
            >
              Liam Bennett
            </Text>
            <Text
              style={[
                styles.quoteIcon,
                { color: colors.accent, fontStyle: "italic" },
              ]}
            >
              "
            </Text>
          </View>
          <Image
            source={{
              uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
            }}
            style={styles.profileImage}
          />
        </View>

        {/* Statistics Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.statsSection}
        >
          {/* Stat 1 */}
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            >
              <Text style={styles.statIcon}>📊</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.white }]}>
              1200+
            </Text>
            <Text style={[styles.statLabel, { color: colors.white }]}>
              people supported
            </Text>
          </View>
          {/* Stat 2 */}
          <View style={styles.statItem}>
            <View
              style={[
                styles.statIconCircle,
                { backgroundColor: "rgba(255,255,255,0.3)" },
              ]}
            >
              <Text style={styles.statIcon}>🏆</Text>
            </View>
            <Text style={[styles.statNumber, { color: colors.white }]}>
              35+
            </Text>
            <Text style={[styles.statLabel, { color: colors.white }]}>
              landmark cases
            </Text>
          </View>
        </LinearGradient>

        {/* Innovative Legal Strategies Section */}
        <View
          style={[styles.innovativeSection, { backgroundColor: colors.light }]}
        >
          <View style={styles.protectedInterests}>
            <Text style={[styles.protectedText, { color: colors.primary }]}>
              1500+ protected
            </Text>
            <View style={styles.shieldIcon}>
              <Text style={styles.shieldEmoji}>🛡️</Text>
            </View>
            <Text style={[styles.interestsText, { color: colors.primary }]}>
              interests
            </Text>
          </View>
          <Text style={[styles.innovativeTitle, { color: colors.primary }]}>
            Innovative{"\n"}legal strategies{"\n"}for equality and justice
          </Text>
          <TouchableOpacity
            style={[styles.consultButton, { backgroundColor: colors.accent }]}
            onPress={() =>
              navigation.navigate("Lawyer")
            }
          >
            <Text style={[styles.consultButtonText, { color: colors.white }]}>
              Get Legal Help
            </Text>
            <Text style={[styles.arrowIcon, { color: colors.white }]}>→</Text>
          </TouchableOpacity>
          <View style={styles.professionalImageContainer}>
            <Image source={lawyer} style={styles.professionalImage} />
            <View style={styles.decorativeLines}>
              <View
                style={[
                  styles.decorativeLine1,
                  { backgroundColor: colors.darkgray },
                ]}
              />
              <View
                style={[
                  styles.decorativeLine2,
                  { backgroundColor: colors.darkgray },
                ]}
              />
            </View>
          </View>
        </View>

        {/* Header Section */}
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          style={styles.headerSection}
        >
          {/* Team Members & Stats */}
          <View style={styles.statsContainer}>
            <View style={styles.avatarContainer1}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&h=80&fit=crop&crop=face",
                }}
                style={[styles.avatar, { borderColor: colors.white }]}
              />
            </View>
            <View style={styles.yearsSection}>
              <Text style={[styles.bigNumber, { color: colors.white }]}>
                16
              </Text>
              <Text style={[styles.statLabel, { color: colors.white }]}>
                years of advocacy
              </Text>
            </View>
            <View style={styles.avatarContainer2}>
              <Image
                source={{
                  uri: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=80&h=80&fit=crop&crop=face",
                }}
                style={[styles.avatar, { borderColor: colors.white }]}
              />
            </View>
            <TouchableOpacity
              style={[styles.calendarButton, { backgroundColor: colors.white }]}
            >
              <Text style={styles.calendarIcon}>📅</Text>
            </TouchableOpacity>
            <View style={styles.teamSection}>
              <Text style={[styles.bigNumber, { color: colors.white }]}>
                100+
              </Text>
              <Text style={[styles.statLabel, { color: colors.white }]}>
                dedicated volunteers
              </Text>
            </View>
          </View>
          <View style={styles.decorativeLines}>
            <View
              style={[
                styles.line1,
                { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              ]}
            />
            <View
              style={[
                styles.line2,
                { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              ]}
            />
            <View
              style={[
                styles.line3,
                { backgroundColor: "rgba(255, 255, 255, 0.3)" },
              ]}
            />
          </View>
        </LinearGradient>

        {/* Victories Section */}
        <View
          style={[styles.victoriesSection, { backgroundColor: colors.white }]}
        >
          <View style={styles.victoriesHeader}>
            <Text style={[styles.victoriesTitle, { color: colors.primary }]}>
              Victories that empower {"\n"}communities
            </Text>
            <Text style={styles.trophyIcon}>🏆</Text>
          </View>
          <View style={styles.caseDescription}>
            <Text style={[styles.caseText, { color: colors.darkgray }]}>
              <Text style={[styles.lightText, { color: colors.darkgray }]}>
                We successfully represented{" "}
              </Text>
              <Text style={[styles.boldText, { color: colors.primary }]}>
                LGBTQ+
              </Text>
              <Text style={[styles.lightText, { color: colors.darkgray }]}>
                {" "}
                individuals who were denied employment We supported
              </Text>
              <Text style={[styles.boldText, { color: colors.primary }]}>
                families of disabled children
              </Text>
              <Text style={[styles.lightText, { color: colors.darkgray }]}>
                {" "}
                to secure their right to inclusive{" "}
              </Text>
              <Text style={[styles.boldText, { color: colors.primary }]}>
                education.
              </Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Styles (static styles only, colors applied dynamically)
const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { paddingBottom: 30 },
  headerSection: {
    paddingTop: 60,
    paddingBottom: 40,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    position: "relative",
    minHeight: 500,
  },
  testimonialSection: {
    flexDirection: "row",
    marginHorizontal: 0,
    marginTop: 10,
    padding: 20,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "space-between",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
    fontStyle: "italic",
  },
  testimonialContent: { flex: 1, paddingRight: 10, fontStyle: "italic" },
  quoteIcon: { fontSize: 30, marginBottom: 5 },
  testimonialText: { fontSize: 20, fontWeight: "light", lineHeight: 28 },
  profileImage: { width: 80, height: 80, borderRadius: 40 },
  profileName: { marginTop: 10, fontSize: 16 },
  statsSection: {
    marginTop: -30,
    marginHorizontal: 0,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingVertical: 50,
    alignItems: "center",
  },
  statItem: { alignItems: "center", marginVertical: 20 },
  statIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  statIcon: { fontSize: 20 },
  statNumber: { fontSize: 60, fontWeight: "bold" },
  innovativeSection: {
    paddingHorizontal: 20,
    paddingVertical: 0,
    minHeight: 600,
  },
  protectedInterests: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    justifyContent: "center",
  },
  protectedText: { fontSize: 16, fontWeight: "600", paddingVertical: 40 },
  shieldIcon: { marginHorizontal: 8 },
  shieldEmoji: { fontSize: 18 },
  interestsText: { fontSize: 16, fontWeight: "600" },
  innovativeTitle: {
    fontSize: 36,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 42,
    marginBottom: 30,
  },
  consultButton: {
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginBottom: 40,
  },
  consultButtonText: { fontSize: 16, fontWeight: "600", marginRight: 8 },
  arrowIcon: { fontSize: 16, fontWeight: "bold" },
  professionalImageContainer: { alignItems: "center", position: "relative" },
  professionalImage: { width: 200, height: 300, resizeMode: "cover" },
  decorativeLines: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  decorativeLine1: {
    position: "absolute",
    top: 20,
    left: -30,
    width: 60,
    height: 1,
    transform: [{ rotate: "45deg" }],
  },
  decorativeLine2: {
    position: "absolute",
    bottom: 40,
    right: -20,
    width: 80,
    height: 1,
    transform: [{ rotate: "-30deg" }],
  },
  victoriesSection: { padding: 30 },
  victoriesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 30,
  },
  victoriesTitle: { fontSize: 24, fontWeight: "bold", flex: 1, lineHeight: 30 },
  trophyIcon: { fontSize: 30, marginLeft: 15 },
  caseDescription: { marginTop: 20 },
  caseText: { fontSize: 16, lineHeight: 24 },
  lightText: {},
  boldText: { fontWeight: "bold" },
  statsContainer: {
    flex: 1,
    position: "relative",
    justifyContent: "space-around",
  },
  avatarContainer1: {
    position: "absolute",
    top: 20,
    right: 60,
  },
  avatarContainer2: {
    position: "absolute",
    top: 120,
    right: 30,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
  },
  yearsSection: {
    marginTop: 40,
    marginLeft: 20,
  },
  teamSection: {
    marginTop: 80,
    alignItems: "center",
  },
  bigNumber: {
    fontSize: 80,
    fontWeight: "bold",
    lineHeight: 80,
  },
  statLabel: {
    fontSize: 16,
    opacity: 0.9,
    marginTop: 5,
  },
  calendarButton: {
    position: "absolute",
    bottom: 80,
    left: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },
  calendarIcon: {
    fontSize: 20,
  },
  line1: {
    position: "absolute",
    top: 200,
    right: 0,
    width: 100,
    height: 1,
    transform: [{ rotate: "45deg" }],
  },
  line2: {
    position: "absolute",
    bottom: 100,
    left: 0,
    width: 80,
    height: 1,
    transform: [{ rotate: "-30deg" }],
  },
  line3: {
    position: "absolute",
    top: 150,
    left: 50,
    width: 60,
    height: 1,
    transform: [{ rotate: "60deg" }],
  },
});
