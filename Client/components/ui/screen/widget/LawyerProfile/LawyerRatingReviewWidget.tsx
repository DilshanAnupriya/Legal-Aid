import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import { rateLawyer, getLawyerReviews } from "../../../../../service/lawyerService";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ⭐ Helper function to render stars
const renderStars = (rating, onPress) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Text
        key={i}
        style={[styles.star, i <= rating ? styles.filledStar : styles.emptyStar]}
        onPress={() => onPress && onPress(i)}
      >
        ★
      </Text>
    );
  }
  return <View style={styles.starRow}>{stars}</View>;
};

export default function LawyerRatingReviewWidget({ lawyerId }) {
  const [lawyerName, setLawyerName] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviews, setReviews] = useState([]);
  const [userRating, setUserRating] = useState(0);
  const [userComment, setUserComment] = useState("");
  const [loading, setLoading] = useState(true);

  // 🧩 Fetch lawyer reviews from backend
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getLawyerReviews(lawyerId);
        if (data?.success) {
          setLawyerName(data.lawyerName);
          setAverageRating(data.rating);
          setReviews(data.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching lawyer reviews:", error);
        Alert.alert("Error", "Could not load lawyer reviews");
      } finally {
        setLoading(false);
      }
    };

    if (lawyerId) fetchReviews();
  }, [lawyerId]);

  // 📝 Handle new review submission
  const handleSubmit = async () => {
    if (userRating === 0) {
      Alert.alert("Please select a rating");
      return;
    }

    try {
      const token = await AsyncStorage.getItem("userToken");
      const result = await rateLawyer(
        lawyerId,
        { rating: userRating, comment: userComment },
        token
      );

      if (result?.success) {
        Alert.alert("Success", "Review submitted successfully!");
        // Refresh reviews after new submission
        const updatedData = await getLawyerReviews(lawyerId);
        setAverageRating(updatedData.rating);
        setReviews(updatedData.reviews || []);
        setUserRating(0);
        setUserComment("");
      } else {
        Alert.alert("Error", "Failed to submit review");
      }
    } catch (err) {
      console.error("Review submission failed:", err);
      Alert.alert("Failed", err.response?.data?.message || err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading reviews...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rating & Reviews</Text>
      {lawyerName ? (
        <Text style={styles.lawyerName}>Lawyer: {lawyerName}</Text>
      ) : null}

      {/* ⭐ Display average rating and review count */}
      <View style={styles.ratingContainer}>
        {renderStars(Math.round(averageRating))}
        <Text style={styles.ratingText}>{averageRating.toFixed(1)} / 5</Text>
        <Text style={styles.reviewCount}>({reviews.length} reviews)</Text>
      </View>

      {/* 🗒 Display all reviews */}
      <FlatList
        data={reviews}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.reviewItem}>
            <Text style={styles.reviewStars}>
              {"★".repeat(item.rating || 0) + "☆".repeat(5 - (item.rating || 0))}
            </Text>
            <Text style={styles.reviewComment}>
              {item.comment?.trim() ? item.comment : "No comment"}
            </Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.noReviews}>No reviews yet for this lawyer.</Text>
        }
      />

      {/* ✏️ Add new review section */}
      <View style={styles.submitSection}>
        <Text style={styles.subtitle}>Rate this lawyer</Text>
        {renderStars(userRating, setUserRating)}
        <TextInput
          style={styles.input}
          placeholder="Write your review"
          value={userComment}
          onChangeText={setUserComment}
        />
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Review</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 🎨 Styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: "white",
    margin: 15,
    padding: 20,
    borderRadius: 15,
    elevation: 2,
    height: 700
  },
  title: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  lawyerName: { fontSize: 14, color: "#333", marginBottom: 8 },
  subtitle: { fontSize: 14, fontWeight: "bold", marginBottom: 5 },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  star: { fontSize: 18, marginRight: 4 },
  filledStar: { color: "#FFD700" },
  emptyStar: { color: "#ccc" },
  starRow: { flexDirection: "row", marginBottom: 10 },
  ratingText: { fontSize: 14, fontWeight: "bold", marginRight: 5 },
  reviewCount: { fontSize: 12, color: "#666" },
  reviewItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  reviewStars: { fontSize: 14, color: "#FFD700", marginBottom: 3 },
  reviewComment: { fontSize: 12, color: "#333" },
  noReviews: { fontSize: 12, color: "#999", fontStyle: "italic" },
  submitSection: { marginTop: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    marginVertical: 10,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold" },
});
