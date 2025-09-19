import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// @ts-ignore
const NgoCardWidget = ({ item, isGridView = false, onPress }) => {
    const renderStars = (rating: number) => {
        const stars = [];
        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Ionicons
                    key={i}
                    name={i <= rating ? 'star' : 'star-outline'}
                    size={isGridView ? 12 : 14}
                    color={i <= rating ? '#FFD700' : '#DDD'}
                />
            );
        }
        return stars;
    };

    if (isGridView) {
        return (
            <TouchableOpacity
                style={styles.gridCard}
                activeOpacity={0.8}
                onPress={() => onPress && onPress(item)}
            >
                <Image
                    source={{ uri: item.logo || 'https://via.placeholder.com/100' }}
                    style={styles.gridLogo}
                />
                <Text style={styles.gridNgoName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.gridCategory} numberOfLines={1}>
                    {item.category}
                </Text>
                <View style={styles.gridRatingContainer}>
                    {renderStars(item.rating)}
                </View>
                <View style={styles.gridStatusBadge}>
                    <Text style={[
                        styles.gridStatusText,
                        { color: item.status === 'active' ? '#4CAF50' : '#FF5722' }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={styles.ngoCard}
            activeOpacity={0.8}
            onPress={() => onPress && onPress(item)}
        >
            <View style={styles.cardHeader}>
                <Image
                    source={{ uri: item.logo || 'https://via.placeholder.com/60' }}
                    style={styles.ngoLogo}
                />
                <View style={styles.cardHeaderInfo}>
                    <Text style={styles.ngoName} numberOfLines={1}>
                        {item.name}
                    </Text>
                    <Text style={styles.ngoCategory} numberOfLines={1}>
                        {item.category}
                    </Text>
                    <View style={styles.ratingContainer}>
                        {renderStars(item.rating)}
                        <Text style={styles.ratingText}>({item.rating})</Text>
                    </View>
                </View>
                <View style={styles.statusBadge}>
                    <Text style={[
                        styles.statusText,
                        { color: item.status === 'active' ? '#4CAF50' : '#FF5722' }
                    ]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    // List View Styles
    ngoCard: {
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
    ngoLogo: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F0F0',
        marginRight: 12,
    },
    cardHeaderInfo: {
        flex: 1,
    },
    ngoName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    ngoCategory: {
        fontSize: 14,
        color: '#007AFF',
        marginBottom: 6,
        fontWeight: '500',
    },
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 4,
    },
    statusBadge: {
        alignSelf: 'flex-start',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
    },

    // Grid View Styles
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
    gridLogo: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#F0F0F0',
        marginBottom: 12,
    },
    gridNgoName: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1A1A1A',
        textAlign: 'center',
        marginBottom: 6,
        minHeight: 40,
    },
    gridCategory: {
        fontSize: 12,
        color: '#007AFF',
        textAlign: 'center',
        marginBottom: 8,
        fontWeight: '500',
    },
    gridRatingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridStatusBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
    },
    gridStatusText: {
        fontSize: 10,
        fontWeight: 'bold',
    },
});

export default NgoCardWidget;