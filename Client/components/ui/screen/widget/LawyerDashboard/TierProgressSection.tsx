import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useAuth } from "../../../../../context/AuthContext";
import axios from "axios";

// Define tier thresholds
const TIERS = [
  { name: "Community Ally", points: 100 },
  { name: "Legal Helper", points: 300 },
  { name: "Justice Advocate", points: 600 },
  { name: "Legal Mentor", points: 1000 },
  { name: "Champion of Justice", points: Infinity },
];

const TierProgressSection = () => {
  const { user } = useAuth();
  const [totalPoints, setTotalPoints] = useState(0);
  const [currentTier, setCurrentTier] = useState("Community Ally");
  const [nextTierPoints, setNextTierPoints] = useState(0);
  const [progress, setProgress] = useState(new Animated.Value(0));

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Replace with your backend endpoint to get lawyer data
        const response = await axios.get(`https://yourapi.com/users/${user.id}`);
        const lawyer = response.data;
        setTotalPoints(lawyer.totalPoints || 0);
        setCurrentTier(lawyer.tier || "Community Ally");

        const currentTierIndex = TIERS.findIndex((t) => t.name === lawyer.tier);
        const nextTierThreshold = TIERS[currentTierIndex + 1]?.points || lawyer.totalPoints;
        setNextTierPoints(nextTierThreshold);

        // Animate progress bar
        const tierStartPoints = currentTierIndex > 0 ? TIERS[currentTierIndex - 1].points : 0;
        const progressValue = Math.min((lawyer.totalPoints - tierStartPoints) / (nextTierThreshold - tierStartPoints), 1);
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
  }, [user]);

  const pointsToNextTier = nextTierPoints - totalPoints;

  return (
    <View style={styles.container}>
      <Text style={styles.tierTitle}>{currentTier}</Text>
      <Text style={styles.pointsText}>
        {totalPoints} points
        {nextTierPoints !== Infinity ? ` • ${pointsToNextTier} points to next tier` : " • Max tier achieved!"}
      </Text>

      <View style={styles.progressBackground}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>
    </View>
  );
};

export default TierProgressSection;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  progressBackground: {
    height: 10,
    backgroundColor: "#eee",
    borderRadius: 5,
    overflow: "hidden",
  },
  progressBar: {
    height: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
  },
});
