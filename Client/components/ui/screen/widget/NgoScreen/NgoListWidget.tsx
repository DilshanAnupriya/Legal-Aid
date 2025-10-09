import React from 'react';
import { StyleSheet, Text, View, FlatList, RefreshControl, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NgoCard from './NgoCardWidget';


const NgoListWidget = ({
                           data,
                           isGridView,
                           loading,
                           refreshing,
                           onRefresh,
                           onLoadMore,
                           onCardPress,
                           showTopSection = false  // Added this prop
                       }) => {
    const renderNgoCard = ({ item }) => (
        <NgoCard
            item={item}
            isGridView={isGridView}
            onPress={onCardPress}
        />
    );

    const renderFooter = () => {
        if (!loading) return null;
        return (
            <View style={styles.loadingFooter}>
                <ActivityIndicator size="small" color="#007AFF" />
                <Text style={styles.loadingText}>Loading more NGOs...</Text>
            </View>
        );
    };

    const renderEmptyComponent = () => {
        if (loading) return null;
        return (
            <View style={styles.emptyContainer}>
                <Ionicons name="search-outline" size={64} color="#DDD" />
                <Text style={styles.emptyText}>No NGOs found</Text>
                <Text style={styles.emptySubtext}>
                    Try adjusting your search or filter criteria
                </Text>
            </View>
        );
    };

    // Add header for All NGOs section when Top NGOs are shown
    const renderListHeader = () => {
        if (!showTopSection) return null;
        return (
            <View style={styles.allNgosHeader}>
                <Text style={styles.allNgosTitle}>All NGOs</Text>
            </View>
        );
    };

    return (
        <FlatList
            data={data}
            renderItem={renderNgoCard}
            keyExtractor={(item) => item._id}
            style={styles.ngoList}
            contentContainerStyle={[
                styles.ngoListContent,
                showTopSection && styles.ngoListContentWithTop
            ]}
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
            ListHeaderComponent={renderListHeader}
            showsVerticalScrollIndicator={false}
            numColumns={isGridView ? 2 : 1}
            key={isGridView ? 'grid' : 'list'}
            ListEmptyComponent={renderEmptyComponent}
        />
    );
};

const styles = StyleSheet.create({
    ngoList: {
        flex: 1,
    },
    ngoListContent: {
        padding: 16,
    },
    ngoListContentWithTop: {
        paddingTop: 8, // Less padding when Top NGOs section is shown
    },
    allNgosHeader: {
        marginBottom: 16,
        marginTop: 8,
    },
    allNgosTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
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

export default NgoListWidget;