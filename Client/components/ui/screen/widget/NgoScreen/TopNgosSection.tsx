import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
    Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

// @ts-ignore
const TopNgosSection = ({ data, loading, onNgoPress, onViewAll }) => {
    // @ts-ignore
    const renderTopNgoItem = ({ item }) => (
        <TouchableOpacity
            style={styles.topNgoCard}
            onPress={() => onNgoPress(item)}
            activeOpacity={0.7}
        >
            <View style={styles.topNgoImageContainer}>
                <Image
                    source={{
                        uri: item.logo || item.images?.[0] || 'https://via.placeholder.com/80x80?text=NGO'
                    }}
                    style={styles.topNgoImage}
                    resizeMode="cover"
                />
                {/* Rating Badge */}
                <View style={styles.ratingBadge}>
                    <Text style={styles.ratingText}>★ {item.rating?.toFixed(1) || '0.0'}</Text>
                </View>
            </View>

            <View style={styles.topNgoInfo}>
                <Text style={styles.topNgoName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.topNgoCategory} numberOfLines={1}>
                    {item.category}
                </Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.sectionTitle}>Top Rated NGOs</Text>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="small" color="#007BFF" />
                    <Text style={styles.loadingText}>Loading top NGOs...</Text>
                </View>
            </View>
        );
    }

    if (!data || data.length === 0) {
        return null; // Don't render anything if no data
    }

    return (
        <View style={styles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.sectionTitle}>Top Rated NGOs</Text>
                <TouchableOpacity
                    onPress={onViewAll}
                    style={styles.viewAllButton}
                >
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <FlatList
                data={data}
                renderItem={renderTopNgoItem}
                keyExtractor={(item) => item._id?.toString() || Math.random().toString()}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1F2937',
    },
    viewAllButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
    },
    viewAllText: {
        fontSize: 14,
        color: '#007BFF',
        fontWeight: '500',
    },
    listContainer: {
        paddingHorizontal: 12,
    },
    topNgoCard: {
        width: 140,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    topNgoImageContainer: {
        position: 'relative',
        alignItems: 'center',
        marginBottom: 8,
    },
    topNgoImage: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F3F4F6',
    },
    ratingBadge: {
        position: 'absolute',
        top: -4,
        right: 8,
        backgroundColor: '#FFB800',
        borderRadius: 12,
        paddingHorizontal: 6,
        paddingVertical: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 3,
    },
    ratingText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    topNgoInfo: {
        alignItems: 'center',
    },
    topNgoName: {
        fontSize: 13,
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
        marginBottom: 4,
        lineHeight: 16,
    },
    topNgoCategory: {
        fontSize: 11,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: 14,
    },
    separator: {
        width: 12,
    },
    loadingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    loadingText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#6B7280',
    },
});

export default TopNgosSection;