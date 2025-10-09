import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LawyerCard from './LawyerCardWidget';
import BookingModal from '../../../../modals/BookingModal';
import { createAppointment } from '../../../../../service/appointmentSercive';

const LawyerListWidget = ({
  // @ts-ignore
  data,
  // @ts-ignore
  isGridView,
  // @ts-ignore
  loading,
  // @ts-ignore
  refreshing,
  // @ts-ignore
  onRefresh,
  // @ts-ignore
  onLoadMore,
  // @ts-ignore
  onCardPress,
}) => {
  const [selectedLawyer, setSelectedLawyer] = useState(null);
  const [isModalVisible, setModalVisible] = useState(false);

  const handleBook = (lawyer: any) => {
    console.log("selected lawyerrr id : ",lawyer.id)
    setSelectedLawyer(lawyer);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedLawyer(null);
  };

  const handleBookingSubmit = async (bookingData: any) => {
    try {
      if (!selectedLawyer) return;
      console.log("selected lawyer : ",selectedLawyer.id)

      const payload = {
        userId: bookingData.userId, // ensure userId is passed from modal
        lawyerId: selectedLawyer.id,
        date: bookingData.date,
        time: bookingData.time,
        meetingType: bookingData.meetingType,
        description: bookingData.description,
        contactName: bookingData.contactName,
        contactEmail:bookingData.contactEmail ,
        contactPhone: bookingData.contactPhone
      };

      const response = await createAppointment(payload);
      console.log("Appointment Response:", response);

      handleCloseModal();
    } catch (error: any) {
    
      console.error("Appointment Error:", error);
    }
  };


  // @ts-ignore
  const renderLawyerCard = ({ item }) => (
    <LawyerCard
      item={item}
      isGridView={isGridView}
      onPress={onCardPress}
      onBook={handleBook} 
    />
  );

  const renderFooter = () => {
    if (!loading) return null;
    return (
      <View style={styles.loadingFooter}>
        <ActivityIndicator size="small" color="#007AFF" />
        <Text style={styles.loadingText}>Loading more Lawyers...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="search-outline" size={64} color="#DDD" />
        <Text style={styles.emptyText}>No Lawyers found</Text>
        <Text style={styles.emptySubtext}>
          Try adjusting your search or filter criteria
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <FlatList
        data={data}
        renderItem={renderLawyerCard}
        keyExtractor={(item) => item._id}
        style={styles.ngoList}
        contentContainerStyle={styles.ngoListContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        numColumns={isGridView ? 2 : 1}
        key={isGridView ? 'grid' : 'list'}
        ListEmptyComponent={renderEmptyComponent}
      />

      {/* ✅ Booking Modal */}
      <BookingModal
        visible={isModalVisible}
        lawyer={selectedLawyer}
        onClose={handleCloseModal}
        onSubmit={handleBookingSubmit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  ngoList: {
    flex: 1,
  },
  ngoListContent: {
    padding: 16,
  },
  loadingFooter: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#666',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#999',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#BBB',
    marginTop: 4,
    textAlign: 'center',
  },
});

export default LawyerListWidget;
