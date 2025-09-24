import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { useTheme } from '../../../../../context/ThemeContext';

const { width } = Dimensions.get('window');

// @ts-ignore
const LawyerCardWidget = ({ item, isGridView = false, onPress, onChat, onBook }) => {
      const { colors, theme } = useTheme();

    const renderStars = (rating: number) => {
        const stars = [];
        const validRating = rating || 0;
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= validRating ? 'star' : 'star-outline'}
                    size={isGridView ? 12 : 14}
                    color={i <= validRating ? '#FFD700' : '#DDD'}
                />
            );
        }
        return stars;
    };

    const fullName = `${item?.firstName || ''} ${item?.lastName || ''}`.trim() || 'No Name';
    const specialization = item?.specialization || 'Not Specified';
    const rating = item?.rating || 0;
    const status = item?.isApproved ? 'APPROVED' : 'PENDING';
    const experience = item?.experience || 0;
    const logoUri = item?.profilePicture || 'https://via.placeholder.com/100';

    if (isGridView) {
        return (
            <TouchableOpacity
                style={styles.gridCard}
                activeOpacity={0.8}
                onPress={() => onPress && onPress(item)}
            >
                <Image
                    source={{ uri: logoUri }}
                    style={styles.gridLogo}
                />
                <Text style={styles.gridLawyerName} numberOfLines={2}>
                    {fullName}
                </Text>
                <Text style={styles.gridSpecialization} numberOfLines={1}>
                    {specialization}
                </Text>
                <Text style={styles.gridSpecialization} numberOfLines={1}>
                    {experience} yrs experience
                </Text>
                <View style={styles.gridRatingContainer}>
                    {renderStars(rating)}
                </View>
                <View style={styles.gridButtonContainer}>
                    <TouchableOpacity style={styles.button} onPress={() => onChat && onChat(item)}>
                        <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Chat</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={[styles.button, { backgroundColor: '#007AFF' }]} onPress={() => onBook && onBook(item)}>
                        <MaterialIcons name="event-available" size={16} color="#fff" />
                        <Text style={styles.buttonText}>Book</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.gridStatusBadge}>
                    <Text style={[
                        styles.gridStatusText,
                        { color: item?.isApproved ? '#4CAF50' : '#FF5722' }
                    ]}>
                        {status}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.listCard}
            activeOpacity={0.8}
            onPress={() => onPress && onPress(item)}
        >
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: logoUri }}
                    style={styles.listLogo}
                />
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.listLawyerName} numberOfLines={1}>
                        {fullName}
                    </Text>
                    <Text style={styles.listSpecialization} numberOfLines={1}>
                        {specialization}
                    </Text>
                    <Text style={styles.listSpecialization}>{experience} yrs experience</Text>
                    <View style={styles.ratingContainer}>
                        {renderStars(rating)}
                        <Text style={styles.ratingText}>({rating})</Text>
                    </View>
                    <View style={styles.listButtonContainer}>
                        <TouchableOpacity style={styles.button} onPress={() => onChat && onChat(item)}>
                            <Ionicons name="chatbubble-ellipses-outline" size={16} color="#fff" />
                            <Text style={styles.buttonText}>Chat</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary }]} onPress={() => onBook && onBook(item)}>
                            <MaterialIcons name="event-available" size={16} color="#fff" />
                            <Text style={styles.buttonText}>Book</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={[
                        styles.statusText,
                        { color: item?.isApproved ? '#4CAF50' : '#FF5722' }
                    ]}>
                        {status}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    listCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    listLogo: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#F0F0F0', marginRight: 12 },
    cardHeaderInfo: { flex: 1 },
    listLawyerName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    listSpecialization: { fontSize: 14, color: '#545c64ff', marginBottom: 6, fontWeight: '500' },
    ratingContainer: { flexDirection: 'row', alignItems: 'center' },
    ratingText: { fontSize: 12, color: '#666', marginLeft: 4 },
    statusBadge: { alignSelf: 'flex-start' },
    statusText: { fontSize: 12, fontWeight: 'bold' },
    listButtonContainer: { flexDirection: 'row', marginTop: 8 },

    // Grid Styles
    gridCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        margin: 8,
        width: (width - 48) / 2,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
    },
    gridLogo: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#F0F0F0', marginBottom: 12 },
    gridLawyerName: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', textAlign: 'center', marginBottom: 6, minHeight: 40 },
    gridSpecialization: { fontSize: 12, color: '#007AFF', textAlign: 'center', marginBottom: 8, fontWeight: '500' },
    gridRatingContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
    gridButtonContainer: { flexDirection: 'row', marginTop: 8 },
    gridStatusBadge: { position: 'absolute', top: 12, right: 12 },
    gridStatusText: { fontSize: 10, fontWeight: 'bold' },

    button: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        backgroundColor: '#e67e22',
        marginRight: 8,
    },
    buttonText: { color: '#fff', fontSize: 12, marginLeft: 4 },
});

export default LawyerCardWidget;
