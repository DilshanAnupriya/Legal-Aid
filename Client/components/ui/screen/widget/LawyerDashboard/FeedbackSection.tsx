import React from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const reviews = [
  { id: '1', user: 'John Doe', rating: 5, comment: 'Very helpful and kind!' },
  { id: '2', user: 'Sara Ali', rating: 4, comment: 'Great advice, quick response.' },
];

const FeedbackSection = () => {
  return (
    <View style={styles.card}>
      <Text style={styles.sectionTitle}>Feedback & Reviews</Text>
      <FlatList
        data={reviews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reviewCard}>
            <View style={{ flex: 1 }}>
              <Text style={styles.userName}>{item.user}</Text>
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
