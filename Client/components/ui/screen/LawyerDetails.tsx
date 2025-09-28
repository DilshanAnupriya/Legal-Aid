import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, StatusBar, SafeAreaView } from "react-native";

// Import custom components
import LawyerProfileHeader from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileHeaderWidget";
import LawyerProfileStats from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileStatsWidget";
import LawyerProfileAbout from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileAboutWidget";
import LawyerProfileContact from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileContactWidget";
import LawyerProfileAvailability from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileAvailabilityWidget";
import LawyerProfileSpecialization from "@/components/ui/screen/widget/LawyerProfile/LawyerProfileSpecializationWidget";

export default function LawyerProfile({ route }) {
  const [lawyerData, setLawyerData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Get lawyer ID from route params
  const lawyerId = route?.params?.lawyerId;

  useEffect(() => {
    fetchLawyerProfile();
  }, [lawyerId]);

  const fetchLawyerProfile = async () => {
    setLoading(true);
    try {
      // Replace with actual API call
      // const response = await getLawyerById(lawyerId);
      // setLawyerData(response.data);
      
      // Mock data for now
      setLawyerData({
        id: 1,
        name: "Advocate Anura Silva",
        specialty: "Family Law & Divorce Attorney",
        rating: 4.8,
        reviewCount: 127,
        experience: 15,
        clientWinRate: 88,
        responseTime: 92,
        successRate: 90,
        bio: "With over 15 years of experience in family law, I specialize in helping individuals and families navigate some of life's most challenging and compassionate and sensitive. My practice focuses on divorce proceedings, child custody arrangements, and domestic relations matters.\n\nI am committed to providing accessible legal services to marginalized communities and believe that everyone deserves quality legal representation regardless of their financial situation. I offer both traditional consultation services and anonymous chat options to ensure clients feel comfortable seeking guidance.\n\nFluent in Sinhala, Tamil, and English, I ensure clear communication with all my clients throughout the legal process.",
        contactInfo: {
          email: "Available through platform messaging",
          hotline: "24/7 Emergency Support",
          office: "Colombo, Western Province",
          languages: "Sinhala, Tamil, English"
        },
        availability: [
          { day: 'Mon', date: 26, available: false },
          { day: 'Tue', date: 27, available: true },
          { day: 'Wed', date: 28, available: true },
          { day: 'Thu', date: 29, available: true },
          { day: 'Fri', date: 30, available: false },
          { day: 'Sat', date: 31, available: true },
          { day: 'Sun', date: 1, available: true }
        ],
        specializations: [
          {
            title: 'Divorce & Separation',
            description: 'Contested and uncontested divorces, legal separation agreements'
          },
          {
            title: 'Child Custody',
            description: 'Custody arrangements, visitation rights, child support'
          },
          {
            title: 'Domestic Violence',
            description: 'Protection orders, restraining orders, legal advocacy'
          },
          {
            title: 'Property Division',
            description: 'Asset distribution, property settlements, financial agreements'
          }
        ]
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
          name={lawyerData.name}
          specialty={lawyerData.specialty}
          rating={lawyerData.rating}
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
        <LawyerProfileAbout
          bio={lawyerData.bio}
        />

        {/* Contact Information Section */}
        <LawyerProfileContact
          contactInfo={lawyerData.contactInfo}
        />

        {/* Availability Section */}
        <LawyerProfileAvailability
          availability={lawyerData.availability}
          onDaySelect={handleDaySelect}
        />

        {/* Specialization Section */}
        <LawyerProfileSpecialization
          specializations={lawyerData.specializations}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});