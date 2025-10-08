import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, FlatList, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getLawyerReviews } from "../../../../../service/lawyerService";
import { useAuth } from '@/context/AuthContext';

const FeedbackSection = () => {
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
      <View style={[styles.card, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#0000ff" />
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.fixedContainer]}>
      <Text style={styles.sectionTitle}>Feedback & Reviews</Text>
      {reviewsList.length === 0 ? (
        <Text>No reviews yet.</Text>
      ) : (
        <FlatList
          data={reviewsList}
          keyExtractor={(item, index) => index.toString()}
          renderItem={({ item }) => (
            <View style={styles.reviewCard}>
              <View>
                <Text style={styles.userName}>{item.userName || "Anonymous"}</Text>
                <Text style={styles.comment}>{item.comment}</Text>
              </View>
              <View style={styles.ratingContainer}>
                {[...Array(item.rating)].map((_, i) => (
                  <Ionicons key={i} name="star" size={16} color="#FFD700" />
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
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
    color: '#333',
  },
  reviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#F4F4F4',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  userName: { fontSize: 16, fontWeight: '600' },
  comment: { color: '#777', marginTop: 4 },
  ratingContainer: { flexDirection: 'row', alignItems: 'center' },
});
