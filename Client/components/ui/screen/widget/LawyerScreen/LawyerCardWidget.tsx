import React from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
  Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../../../../../context/ThemeContext";
import { COLOR } from "@/constants/ColorPallet";

const { width } = Dimensions.get("window");

// Tier list (same as TierProgressSection)
const TIERS = [
  { name: "Community Ally", points: 100, badge: "https://img.icons8.com/fluency/96/handshake--v1.png", color: "#6C757D" },
  { name: "Legal Helper", points: 300, badge: "https://img.icons8.com/fluency/96/helping-hand.png", color: "#17A2B8" },
  { name: "Justice Advocate", points: 600, badge: "https://img.icons8.com/fluency/96/scales.png", color: "#FFC107" },
  { name: "Legal Mentor", points: 1000, badge: "https://img.icons8.com/fluency/96/guru.png", color: "#FF6B6B" },
  { name: "Champion of Justice", points: Infinity, badge: "https://img.icons8.com/fluency/96/trophy.png", color: "#FFD700" },
];

const getTierData = (tierName) => {
  return TIERS.find((t) => t.name === tierName) || TIERS[0];
};

// @ts-ignore
const LawyerCardWidget = ({
  item,
  isGridView = false,
  onPress,
  onChat,
  onBook,
}) => {
  const { colors } = useTheme();

  const renderStars = (rating) => {
    const stars = [];
    const validRating = rating || 0;
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Ionicons
          key={i}
          name={i <= validRating ? "star" : "star-outline"}
          size={isGridView ? 12 : 14}
          color={i <= validRating ? "#FFD700" : "#DDD"}
        />
      );
    }
    return stars;
  };

  const fullName =
    `${item?.firstName || ""} ${item?.lastName || ""}`.trim() || "No Name";
  const specialization = item?.specialization || "Not Specified";
  const rating = item?.rating || 0;
  const status = item?.lawyerStatus || "pending";
  const experience = item?.experience || 0;
  const logoUri = item?.profilePicture || "https://via.placeholder.com/100";
  const tierName = item?.tier || "Community Ally";
  const tierData = getTierData(tierName);

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "#4CAF50";
      case "rejected":
        return "#FF3B30";
      case "pending":
      default:
        return "#FFA500";
    }
  };

  if (isGridView) {
    return (
      <TouchableOpacity
        style={styles.gridCard}
        activeOpacity={0.8}
        onPress={() => onPress && onPress(item)}
      >
        <Image source={{ uri: logoUri }} style={styles.gridLogo} />
        <Text style={styles.gridLawyerName} numberOfLines={2}>
          {fullName}
        </Text>
        <Text style={styles.gridSpecialization} numberOfLines={1}>
          {specialization}
        </Text>
        

        {/* Tier Display */}
        <View style={styles.tierContainer}>
          <Image
            source={{ uri: tierData.badge }}
            style={styles.tierBadge}
            resizeMode="contain"
          />
          <Text style={[styles.tierText, { color: tierData.color }]}>
            {tierData.name}
          </Text>
        </View>

        <View style={styles.gridRatingContainer}>{renderStars(rating)}</View>

        <View style={styles.gridButtonContainer}>
          <TouchableOpacity
            style={styles.button}
            onPress={() => onChat && onChat(item)}
          >
            <Ionicons
              name="chatbubble-ellipses-outline"
              size={16}
              color="#fff"
            />
            <Text style={styles.buttonText}>Chat</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.secondary}]}
            onPress={() => onBook && onBook(item)}
          >
            <MaterialIcons name="event-available" size={16} color="#fff" />
            <Text style={styles.buttonText}>Book</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.gridStatusBadge}>
          <Text
            style={[
              styles.gridStatusText,
              { color: getStatusColor(status) },
            ]}
          >
            {status}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // LIST VIEW
  return (
    <TouchableOpacity
      style={styles.listCard}
      activeOpacity={0.8}
      onPress={() => onPress && onPress(item)}
    >
      <View style={styles.cardHeader}>
        <Image source={{ uri: logoUri }} style={styles.listLogo} />

        <View style={styles.cardHeaderInfo}>
          <Text style={styles.listLawyerName} numberOfLines={1}>
            {fullName}
          </Text>
          <Text style={styles.listSpecialization} numberOfLines={1}>
            {specialization}
          </Text>
          <Text style={styles.listSpecialization}>
            {experience} yrs experience
          </Text>

          {/* Tier Display */}
          <View style={styles.tierContainerInline}>
            <Image
              source={{ uri: tierData.badge }}
              style={styles.tierBadgeSmall}
              resizeMode="contain"
            />
            <Text style={[styles.tierTextSmall, { color: tierData.color }]}>
              {tierData.name}
            </Text>
          </View>

          <View style={styles.ratingContainer}>
            {renderStars(rating)}
            <Text style={styles.ratingText}>({rating})</Text>
          </View>

          <View style={styles.listButtonContainer}>
            <TouchableOpacity
              style={styles.button}
              onPress={() => onChat && onChat(item)}
            >
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={16}
                color="#fff"
              />
              <Text style={styles.buttonText}>Chat</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.secondary}]}
              onPress={() => onBook && onBook(item)}
            >
              <MaterialIcons name="event-available" size={16} color="#fff" />
              <Text style={styles.buttonText}>Book</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.statusBadge}>
          <Text
            style={[
              styles.statusText,
              { color: getStatusColor(status) },
            ]}
          >
            {status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  listCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  listLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
    marginRight: 12,
  },
  cardHeaderInfo: { flex: 1 },
  listLawyerName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  listSpecialization: {
    fontSize: 14,
    color: "#545c64ff",
    marginBottom: 6,
    fontWeight: "500",
  },
  ratingContainer: { flexDirection: "row", alignItems: "center" },
  ratingText: { fontSize: 12, color: "#666", marginLeft: 4 },
  statusBadge: { alignSelf: "flex-start" },
  statusText: { fontSize: 12, fontWeight: "bold" },
  listButtonContainer: { flexDirection: "row", marginTop: 8 },

  // Tier
  tierContainer: {
    alignItems: "center",
    marginBottom: 8,
  },
  tierBadge: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  tierText: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
  },
  tierContainerInline: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tierBadgeSmall: { width: 20, height: 20, marginRight: 6 },
  tierTextSmall: { fontSize: 13, fontWeight: "600" },

  // Grid Styles
  gridCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    margin: 8,
    width: (width - 48) / 2,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  gridLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  gridLawyerName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1A1A1A",
    textAlign: "center",
    marginBottom: 6,
    minHeight: 40,
  },
  gridSpecialization: {
    fontSize: 12,
    color: "#007AFF",
    textAlign: "center",
    marginBottom: 8,
    fontWeight: "500",
  },
  gridRatingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  gridButtonContainer: { flexDirection: "row", marginTop: 8 },
  gridStatusBadge: { position: "absolute", top: 12, right: 12 },
  gridStatusText: { fontSize: 10, fontWeight: "bold" },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#e67e22",
    marginRight: 8,
  },
  buttonText: { color: "#fff", fontSize: 12, marginLeft: 4 },
});

export default LawyerCardWidget;
