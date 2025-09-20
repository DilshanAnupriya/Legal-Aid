import React from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    Image,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';

// @ts-ignore
const TopNgosSectionVertical = ({ data, loading, onNgoPress, onViewAll }) => {
    // @ts-ignore
    const renderTopNgoItem = ({ item, index }) => (
        <TouchableOpacity
            style={styles.topNgoItem}
            onPress={() => onNgoPress(item)}
            activeOpacity={0.7}
        >
            {/* Rank Badge */}
            <View style={styles.rankBadge}>
                <Text style={styles.rankText}>{index + 1}</Text>
            </View>

            {/* NGO Logo */}
            <Image
                source={{
                    uri: item.logo || item.images?.[0] || 'https://via.placeholder.com/50x50?text=NGO'
                }}
                style={styles.ngoLogo}
                resizeMode="cover"
            />

            {/* NGO Info */}
            <View style={styles.ngoInfo}>
                <Text style={styles.ngoName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.ngoCategory} numberOfLines={1}>
                    {item.category}
                </Text>
            </View>

            {/* Rating */}
            <View style={styles.ratingContainer}>
                <Text style={styles.ratingText}>★ {item.rating?.toFixed(1) || '0.0'}</Text>
            </View>
        </TouchableOpacity>
    );

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.headerContainer}>
                    <Text style={styles.sectionTitle}>🏆 Top Rated NGOs</Text>
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
                <Text style={styles.sectionTitle}>🏆 Top Rated NGOs</Text>
                <TouchableOpacity
                    onPress={onViewAll}
                    style={styles.viewAllButton}
                >
                    <Text style={styles.viewAllText}>View All</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.listContainer}>
                {data.slice(0, 3).map((item, index) => (
                    <View key={item._id?.toString() || Math.random().toString()}>
                        {renderTopNgoItem({ item, index })}
                        {index < Math.min(data.length - 1, 2) && <View style={styles.itemSeparator} />}
                    </View>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 12,
        borderRadius: 12,
        padding: 16,
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
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#1F2937',
    },
    viewAllButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: '#F3F4F6',
    },
    viewAllText: {
        fontSize: 12,
        color: '#007BFF',
        fontWeight: '600',
    },
    listContainer: {
        gap: 0,
    },
    topNgoItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
    },
    rankBadge: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#FFB800',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    rankText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    ngoLogo: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F3F4F6',
        marginRight: 12,
    },
    ngoInfo: {
        flex: 1,
        paddingRight: 8,
    },
    ngoName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: 2,
    },
    ngoCategory: {
        fontSize: 12,
        color: '#6B7280',
        lineHeight: 16,
    },
    ratingContainer: {
        backgroundColor: '#FEF3C7',
        borderRadius: 8,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderWidth: 1,
        borderColor: '#FFB800',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#92400E',
    },
    itemSeparator: {
        height: 1,
        backgroundColor: '#F3F4F6',
        marginVertical: 8,
        marginLeft: 48, // Align with the content after rank badge
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

export default TopNgosSectionVertical;