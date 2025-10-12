import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerReviews } from "../../../../../service/lawyerService";
import { useAuth } from '@/context/AuthContext';
import { useTheme } from "../../../../../context/ThemeContext";

const FeedbackSection = () => {
  const { colors } = useTheme();
  const [lawyerName, setLawyerName] = useState("");
  const [averageRating, setAverageRating] = useState(0);
  const [reviewsList, setReviewsList] = useState([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await getLawyerReviews(user.id);
        if (data?.success) {
          setLawyerName(data.lawyerName);
          setAverageRating(data.rating);
          setReviewsList(data.reviews || []);
        }
      } catch (error) {
        console.error("Error fetching lawyer reviews:", error);
        Alert.alert("Error", "Could not load lawyer reviews");
      } finally {
        setLoading(false);
      }
    };

    if (user?.id) fetchReviews();
  }, [user?.id]);

  if (loading) {
    return (
      <View style={[styles.card, styles.loadingContainer, { backgroundColor: colors.white }]}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.fixedContainer, { backgroundColor: colors.white, shadowColor: colors.shadow }]}>
      <Text style={[styles.sectionTitle, { color: colors.primary }]}>Feedback & Reviews</Text>
      {reviewsList.length === 0 ? (
        <Text style={{ color: colors.secondary }}>No reviews yet.</Text>
      ) : (
        <FlatList
          data={reviewsList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={[styles.reviewCard, { backgroundColor: colors.light }]}>
              <View>
                <Text style={[styles.userName, { color: colors.primary }]}>{item.userName || "Anonymous"}</Text>
                <Text style={[styles.comment, { color: colors.secondary }]}>{item.comment}</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(item.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color={colors.star || "#FFD700"} />
                ))}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

export default FeedbackSection;

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  fixedContainer: {
    height: 300, // Fixed height for the section
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    height: 150,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  reviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  userName: { fontSize: 16, fontWeight: '600' },
  comment: { marginTop: 4, fontSize: 13 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
});
