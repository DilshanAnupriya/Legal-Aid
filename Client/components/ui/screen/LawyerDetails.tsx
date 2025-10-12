import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  StatusBar,
  SafeAreaView,
} from "react-native";

// Import custom components
import LawyerProfileHeader from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileHeaderWidget";
import LawyerProfileStats from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileStatsWidget";
import LawyerProfileAbout from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileAboutWidget";
import LawyerProfileContact from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileContactWidget";
import LawyerProfileAvailability from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileAvailabilityWidget";
import LawyerProfileSpecialization from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileSpecializationWidget";
import LawyerRatingReviewWidget from "@/components/ui/screen/widget/LawyerProfile/LawyerRatingReviewWidget";

import { getLawyerProfile } from "@/service/lawyerService";

export default function LawyerProfile({ route }) {
  const [lawyerData, setLawyerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Get lawyer ID from route params
  const lawyerId = route?.params?.lawyerId;
  console.log("lawyer id 1: ", lawyerId);

  useEffect(() => {
    fetchLawyerProfile();
  }, [lawyerId]);

  const fetchLawyerProfile = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    try {
      const data = await getLawyerProfile(lawyerId);
      console.log("data : ",data)

      setLawyerData({
        ...data,
        availability: [
          { day: "Mon", date: 26, available: false },
          { day: "Tue", date: 27, available: true },
          { day: "Wed", date: 28, available: true },
          { day: "Thu", date: 29, available: true },
          { day: "Fri", date: 30, available: false },
          { day: "Sat", date: 31, available: true },
          { day: "Sun", date: 1, available: true },
        ],
      });
    } catch (error) {
      console.error("Error fetching lawyer profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = () => {
    console.log("Start anonymous chat pressed");
    // Navigation to chat screen
  };

  const handleBookConsultation = () => {
    console.log("Book consultation pressed");
    // Navigation to booking screen
  };

  const handleDaySelect = (dayIndex) => {
    console.log("Day selected:", dayIndex);
    // Handle day selection for booking
  };

  if (loading || !lawyerData) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          {/* Add loading component here */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <ScrollView
        showsVerticalScrollIndicator={true}
        bounces={true}
        scrollEnabled={true}
        nestedScrollEnabled={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header Section */}
        <LawyerProfileHeader
          name={`${lawyerData.lawyerDetails.firstName} ${lawyerData.lawyerDetails.lastName}`}
          specialty={lawyerData.lawyerDetails.specialization}
          rating={lawyerData.lawyerDetails.rating}
          reviewCount={lawyerData.reviewCount}
          onStartChat={handleStartChat}
          onBookConsultation={handleBookConsultation}
        />

        {/* Stats Section */}
        <LawyerProfileStats
          experience={lawyerData.experience}
          clientWinRate={lawyerData.clientWinRate}
          responseTime={lawyerData.responseTime}
          successRate={lawyerData.successRate}
        />

        {/* About Section */}
        <LawyerProfileAbout bio={lawyerData.aboutMe} />

        {/* Contact Information Section */}
        <LawyerProfileContact contactInfo={lawyerData.contactInfo} />

        {/* Availability Section */}
        <LawyerProfileAvailability
          availability={lawyerData.availability}
          onDaySelect={handleDaySelect}
        />

        {/* Specialization Section */}
        <LawyerProfileSpecialization
          specializations={[
            { title: lawyerData.lawyerDetails.specialization, description: "" },
          ]}
        />

        {/* Rating & Reviews Section */}
        <LawyerRatingReviewWidget
          lawyerId={lawyerId}
          rating={lawyerData.rating}
          reviews={lawyerData.reviews}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },

  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
