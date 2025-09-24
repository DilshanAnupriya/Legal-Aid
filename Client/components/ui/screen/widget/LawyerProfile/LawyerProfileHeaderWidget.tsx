import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';

export default function LawyerProfileHeaderWidget({
  name,
  specialty,
  rating,
  reviewCount,
  onStartChat,
  onBookConsultation
}) {
  return (
    <View style={styles.headerSection}>
      <View style={styles.profileIcon}>
        <Text style={styles.profileIconText}>👤</Text>
      </View>
      
      <Text style={styles.lawyerName}>{name}</Text>
      <Text style={styles.specialty}>{specialty}</Text>
      
      <View style={styles.ratingContainer}>
        <Text style={styles.rating}>⭐ {rating}/5 ({reviewCount} reviews)</Text>
      </View>
      
      <TouchableOpacity 
        style={styles.anonymousChatButton}
        onPress={onStartChat}
      >
        <Text style={styles.buttonText}>Start Anonymous chat</Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.consultationButton}
        onPress={onBookConsultation}
      >
        <Text style={styles.consultationButtonText}>Book consultation</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  headerSection: {
    backgroundColor: '#e8e8e8',
    padding: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  profileIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#333',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  profileIconText: {
    fontSize: 24,
    color: 'white',
  },
  lawyerName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  specialty: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
  },
  ratingContainer: {
    marginBottom: 20,
  },
  rating: {
    fontSize: 12,
    color: '#666',
  },
  anonymousChatButton: {
    backgroundColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    marginBottom: 10,
    width: '80%',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  consultationButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#666',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    width: '80%',
  },
  consultationButtonText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
});