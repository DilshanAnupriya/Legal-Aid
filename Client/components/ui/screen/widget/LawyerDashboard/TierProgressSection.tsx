import React, { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, Animated, Image, TouchableOpacity, LayoutAnimation, UIManager, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../../../../context/AuthContext";
import axios from "axios";

// Enable layout animation on Android
if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const TIERS = [
  { name: "Community Ally", points: 100, badge: "https://img.icons8.com/fluency/96/handshake--v1.png", color: "#6C757D" },
  { name: "Legal Helper", points: 300, badge: "https://img.icons8.com/fluency/96/helping-hand.png", color: "#17A2B8" },
  { name: "Justice Advocate", points: 600, badge: "https://img.icons8.com/fluency/96/scales.png", color: "#FFC107" },
  { name: "Legal Mentor", points: 1000, badge: "https://img.icons8.com/fluency/96/guru.png", color: "#FF6B6B" },
  { name: "Champion of Justice", points: Infinity, badge: "https://img.icons8.com/fluency/96/trophy.png", color: "#FFD700" },
];

const POINTS_TABLE = {
  forum_post: 10,
  forum_reply: 5,
  case_completed: 50,
  appointment_held: 20,
  appointment_cancel: -20,
};

const RATING_POINTS = {
  5: 10,
  4: 5,
  3: 1,
  2: -5,
  1: -10,
};

const TierProgressSection = () => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState("Community Ally");
  const [nextTierPoints, setNextTierPoints] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));
  const [currentTierData, setCurrentTierData] = useState(TIERS[0]);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(`http://localhost:3000/api/lawyers/${user.id}/tier`);
        const lawyer = response.data;

        setTotalPoints(lawyer.totalPoints || 0);
        setCurrentTier(lawyer.tier || "Community Ally");

        const currentTierIndex = TIERS.findIndex((t) => t.name === lawyer.tier);
        const tierData = TIERS[currentTierIndex] || TIERS[0];
        setCurrentTierData(tierData);

        const nextTierThreshold = TIERS[currentTierIndex + 1]?.points || lawyer.totalPoints;
        setNextTierPoints(nextTierThreshold);

        const tierStartPoints = currentTierIndex > 0 ? TIERS[currentTierIndex - 1].points : 0;
        const progressValue = Math.min(
          (lawyer.totalPoints - tierStartPoints) / (nextTierThreshold - tierStartPoints),
          1
        );

        Animated.timing(progress, {
          toValue: progressValue,
          duration: 800,
          useNativeDriver: false,
        }).start();
      } catch (err) {
        console.error("Error fetching lawyer points:", err);
      }
    };

    fetchUserData();
    // Removed auto-refresh interval - data will refresh when component remounts
  }, [user]);

  const pointsToNextTier = nextTierPoints - totalPoints;

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.container}>
      {/* Tier Header */}
      <View style={styles.header}>
        <View style={styles.badgeContainer}>
          <Image source={{ uri: currentTierData.badge }} style={styles.badge} resizeMode="contain" />
        </View>
        <View style={styles.tierInfo}>
          <Text style={[styles.tierTitle, { color: currentTierData.color }]}>{currentTier}</Text>
          <Text style={styles.pointsText}>
            {totalPoints} points
            {nextTierPoints !== Infinity
              ? ` • ${pointsToNextTier} to next tier`
              : " • Max tier achieved! 🎉"}
          </Text>
        </View>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              backgroundColor: currentTierData.color,
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* All Tiers */}
      <View style={styles.allTiersContainer}>
        <Text style={styles.allTiersTitle}>All Tiers</Text>
        <View style={styles.tierBadgesRow}>
          {TIERS.map((tier, index) => {
            const isUnlocked = totalPoints >= (index > 0 ? TIERS[index - 1].points : 0);
            const isCurrent = tier.name === currentTier;
            return (
              <View key={tier.name} style={styles.tierBadgeItem}>
                <View
                  style={[
                    styles.smallBadgeContainer,
                    isCurrent && styles.currentBadgeContainer,
                    !isUnlocked && styles.lockedBadgeContainer,
                  ]}
                >
                  <Image
                    source={{ uri: tier.badge }}
                    style={[styles.smallBadge, !isUnlocked && styles.lockedBadge]}
                    resizeMode="contain"
                  />
                </View>
                <Text
                  style={[styles.tierBadgeName, !isUnlocked && styles.lockedText]}
                  numberOfLines={2}
                >
                  {tier.name}
                </Text>
                {tier.points !== Infinity && (
                  <Text style={styles.tierBadgePoints}>{tier.points}pts</Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* Expandable Rules Section */}
      <TouchableOpacity style={styles.dropdownHeader} onPress={toggleExpand}>
        <Text style={styles.dropdownTitle}>How to Earn & Lose Points</Text>
        <Ionicons
          name={expanded ? "chevron-up" : "chevron-down"}
          size={22}
          color="#495057"
        />
      </TouchableOpacity>

      {expanded && (
        <View style={styles.rulesContainer}>
          <Text style={styles.rulesCategory}>⭐ Earn Points</Text>
          {Object.entries(POINTS_TABLE)
            .filter(([_, v]) => v > 0)
            .map(([key, value]) => (
              <View key={key} style={styles.ruleItem}>
                <Ionicons name="add-circle" size={18} color="#28A745" />
                <Text style={styles.ruleText}>{formatRuleName(key)} +{value}</Text>
              </View>
            ))}

          <Text style={[styles.rulesCategory, { marginTop: 10 }]}>⚠️ Lose Points</Text>
          {Object.entries(POINTS_TABLE)
            .filter(([_, v]) => v < 0)
            .map(([key, value]) => (
              <View key={key} style={styles.ruleItem}>
                <Ionicons name="remove-circle" size={18} color="#DC3545" />
                <Text style={styles.ruleText}>{formatRuleName(key)} {value}</Text>
              </View>
            ))}

          <Text style={[styles.rulesCategory, { marginTop: 10 }]}>⭐ Rating Bonuses</Text>
          {Object.entries(RATING_POINTS).map(([stars, value]) => (
            <View key={stars} style={styles.ruleItem}>
              <Ionicons name="star" size={18} color="#FFC107" />
              <Text style={styles.ruleText}>
                {stars}★ Rating → {value > 0 ? `+${value}` : value} points
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
};

const formatRuleName = (key) =>
  key
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());

export default TierProgressSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  badgeContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  badge: { width: 40, height: 40 },
  tierInfo: { flex: 1 },
  tierTitle: { fontSize: 20, fontWeight: "700", marginBottom: 4 },
  pointsText: { fontSize: 13, color: "#666" },
  progressBackground: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
    marginBottom: 16,
  },
  progressBar: { height: 10, borderRadius: 5 },
  allTiersContainer: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#E9ECEF" },
  allTiersTitle: { fontSize: 14, fontWeight: "600", color: "#495057", marginBottom: 12 },
  tierBadgesRow: { flexDirection: "row", justifyContent: "space-between", flexWrap: "wrap" },
  tierBadgeItem: { width: "18%", alignItems: "center", marginBottom: 8 },
  smallBadgeContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#F8F9FA",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
    borderWidth: 2,
    borderColor: "#E9ECEF",
  },
  currentBadgeContainer: { borderColor: "#007AFF", borderWidth: 3, backgroundColor: "#E7F3FF" },
  lockedBadgeContainer: { backgroundColor: "#F1F3F5", borderColor: "#DEE2E6" },
  smallBadge: { width: 28, height: 28 },
  lockedBadge: { opacity: 0.3 },
  tierBadgeName: { fontSize: 9, fontWeight: "600", color: "#495057", textAlign: "center", lineHeight: 11 },
  tierBadgePoints: { fontSize: 8, color: "#868E96", marginTop: 2 },
  lockedText: { color: "#ADB5BD" },
  dropdownHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: "#E9ECEF",
    marginTop: 10,
  },
  dropdownTitle: { fontSize: 14, fontWeight: "600", color: "#343A40" },
  rulesContainer: { paddingVertical: 8, marginTop: 4 },
  rulesCategory: { fontWeight: "700", color: "#212529", marginBottom: 4 },
  ruleItem: { flexDirection: "row", alignItems: "center", marginBottom: 6 },
  ruleText: { marginLeft: 8, fontSize: 13, color: "#495057" },
});
