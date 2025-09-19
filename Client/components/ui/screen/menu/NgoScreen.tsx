import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Alert } from 'react-native';

// Import custom components
import NgoHeader from '@/components/ui/screen/widget/NgoScreen/NgoHeaderWidget';
import NgoSearchBar from '@/components/ui/screen/widget/NgoScreen/NgoSearchBarWidget';
import CategoryFilter from '@/components/ui/screen/widget/NgoScreen/NgoCategoryFilterWidget';
import NgoList from '@/components/ui/screen/widget/NgoScreen/NgoListWidget';
import LoadingOverlay from '@/components/ui/screen/widget/NgoScreen/LoadingOverlayWidget';

export default function NgoScreen() {
    // State management
    const [ngos, setNgos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isGridView, setIsGridView] = useState(true);

    // Categories data
    const categories = [
        'All',
        'Human Rights & Civil Liberties',
        'Women\'s Rights & Gender Justice',
        'Child Protection',
        'Labor & Employment Rights',
        'Refugee & Migrant Rights',
        'LGBTQ+ Rights'
    ];

    // API configuration
    const getApiUrl = () => {
        const DEV_IP = 'localhost'; //192.168.8.189
        return `http://${DEV_IP}:3000/api/ngo`;
    };

    const API_BASE_URL = getApiUrl();

    // Effects
    useEffect(() => {
        fetchNgos();
    }, [searchText, selectedCategory, page]);

    // API Functions
    const fetchNgos = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
            setPage(1);
        } else {
            setLoading(true);
        }

        try {
            const categoryParam = selectedCategory && selectedCategory !== 'All' ? selectedCategory : '';
            const currentPage = isRefresh ? 1 : page;

            const response = await fetch(
                `${API_BASE_URL}/ngo/all?searchText=${searchText}&category=${categoryParam}&page=${currentPage}&size=10`
            );

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message === 'list' && data.data) {
                if (isRefresh || currentPage === 1) {
                    setNgos(data.data);
                } else {
                    // @ts-ignore
                    setNgos(prev => [...prev, ...data.data]);
                }

                setTotalPages(data.pagination?.totalPages || 1);
                setHasNext(data.pagination?.hasNext || false);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch NGOs. Please try again.');
            console.error('Fetch NGOs error:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    // Event Handlers
    const handleRefresh = () => {
        fetchNgos(true);
    };

    const handleLoadMore = () => {
        if (hasNext && !loading) {
            setPage(prev => prev + 1);
        }
    };

    const handleCategorySelect = (category:any) => {
        setSelectedCategory(category === 'All' ? '' : category);
        setPage(1);
        setNgos([]);
    };

    const handleSearch = (text:any) => {
        setSearchText(text);
        setPage(1);
        setNgos([]);
    };

    const handleClearSearch = () => {
        setSearchText('');
        setPage(1);
        setNgos([]);
    };

    const handleViewChange = (gridView:any) => {
        setIsGridView(gridView);
    };

    // @ts-ignore
    const handleCardPress = (item) => {
        // Handle NGO card press - navigate to detail screen or show modal
        console.log('NGO card pressed:', item.name);
        // You can add navigation here
        // navigation.navigate('NgoDetail', { ngo: item });
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

            {/* Header Component */}
            <NgoHeader />

            {/* Search Bar Component */}
            <NgoSearchBar
                searchText={searchText}
                onSearchChange={handleSearch}
                onClearSearch={handleClearSearch}
                isGridView={isGridView}
                onViewChange={handleViewChange}
            />

            {/* Category Filter Component */}
            <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
            />

            {/* NGO List Component */}
            <NgoList
                data={ngos}
                isGridView={isGridView}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onLoadMore={handleLoadMore}
                onCardPress={handleCardPress}
            />

            {/* Loading Overlay Component */}
            <LoadingOverlay
                visible={loading && page === 1}
                message="Loading NGOs..."
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
});