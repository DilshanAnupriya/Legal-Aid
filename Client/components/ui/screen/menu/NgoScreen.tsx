import React, { useState, useEffect } from 'react';
import { StyleSheet, View, StatusBar, Alert } from 'react-native';

// Import custom components
import NgoHeader from '@/components/ui/screen/widget/NgoScreen/NgoHeaderWidget';
import NgoSearchBar from '@/components/ui/screen/widget/NgoScreen/NgoSearchBarWidget';
import CategoryFilter from '@/components/ui/screen/widget/NgoScreen/NgoCategoryFilterWidget';
import NgoList from '@/components/ui/screen/widget/NgoScreen/NgoListWidget';
import LoadingOverlay from '@/components/ui/screen/widget/NgoScreen/LoadingOverlayWidget';
import TopNgosSection from '@/components/ui/screen/widget/NgoScreen/TopNgosSection';

// @ts-ignore
export default function NgoScreen({ navigation }) {
    // State management
    const [ngos, setNgos] = useState([]);
    const [topNgos, setTopNgos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [topNgosLoading, setTopNgosLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [hasNext, setHasNext] = useState(false);
    const [isGridView, setIsGridView] = useState(true);

    // Categories data - Must exactly match database enum values
    const categories = [
        'All',
        'Human Rights & Civil Liberties',
        "Women's Rights & Gender Justice",
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
        fetchTopNgos();
        fetchNgos();
    }, []);

    useEffect(() => {
        fetchNgos();
    }, [searchText, selectedCategory, page]);

    // API Functions
    const fetchTopNgos = async () => {
        setTopNgosLoading(true);
        try {
            const response = await fetch(`${API_BASE_URL}/ngo/top-ratings?limit=5`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message === 'top' && data.data) {
                setTopNgos(data.data);
            }
        } catch (error) {
            console.error('Fetch Top NGOs error:', error);
            // Don't show alert for top NGOs as it's not critical
        } finally {
            setTopNgosLoading(false);
        }
    };

    const fetchNgos = async (isRefresh = false) => {
        if (isRefresh) {
            setRefreshing(true);
            setPage(1);
        } else {
            setLoading(true);
        }

        try {
            // Get the category value - empty string for 'All', otherwise use the selected category
            const categoryParam = selectedCategory === 'All' ? '' : selectedCategory;
            const currentPage = isRefresh ? 1 : page;

            // Build URL with proper encoding
            const url = `${API_BASE_URL}/ngo/all?searchText=${encodeURIComponent(searchText)}&category=${encodeURIComponent(categoryParam)}&page=${currentPage}&size=10`;

            console.log('=== FETCH NGOs DEBUG ===');
            console.log('Selected Category:', selectedCategory);
            console.log('Category Param:', categoryParam);
            console.log('Search Text:', searchText);
            console.log('Page:', currentPage);
            console.log('Full URL:', url);

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            console.log('API Response:', {
                message: data.message,
                dataCount: data.data?.length || 0,
                pagination: data.pagination
            });

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
        fetchTopNgos(); // Also refresh top NGOs
        fetchNgos(true);
    };

    const handleLoadMore = () => {
        if (hasNext && !loading) {
            setPage(prev => prev + 1);
        }
    };

    const handleCategorySelect = (category) => {
        console.log('=== CATEGORY SELECT ===');
        console.log('Category clicked:', category);
        console.log('Previous category:', selectedCategory);

        setSelectedCategory(category);
        setPage(1);
        setNgos([]);
    };

    const handleSearch = (text) => {
        setSearchText(text);
        setPage(1);
        setNgos([]);
    };

    const handleClearSearch = () => {
        setSearchText('');
        setPage(1);
        setNgos([]);
    };

    const handleViewChange = (gridView) => {
        setIsGridView(gridView);
    };

    // Updated card press handler to navigate to profile
    const handleCardPress = (item:any) => {
        console.log('NGO card pressed:', item.name);

        // Navigate to NGO Profile screen
        if (navigation && item._id) {
            navigation.navigate('NgoProfile', {
                ngoId: item._id,
                ngoName: item.name // Optional: pass name for header if needed
            });
        } else {
            Alert.alert('Error', 'Unable to view NGO profile. Please try again.');
        }
    };

    const handleTopNgoPress = (item) => {
        handleCardPress(item); // Reuse the same navigation logic
    };

    const handleViewAllTopNgos = () => {
        // Optional: Navigate to a dedicated top NGOs screen or filter current list
        console.log('View all top NGOs pressed');
    };

    // Determine if we should show top NGOs section
    const showTopNgos = !searchText && selectedCategory === 'All' && topNgos.length > 0;

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

            {/* Top NGOs Section - Show above All NGOs */}
            {showTopNgos && (
                <TopNgosSection
                    data={topNgos}
                    loading={topNgosLoading}
                    onNgoPress={handleTopNgoPress}
                    onViewAll={handleViewAllTopNgos}
                />
            )}

            {/* NGO List Component - All NGOs */}
            <NgoList
                data={ngos}
                isGridView={isGridView}
                loading={loading}
                refreshing={refreshing}
                onRefresh={handleRefresh}
                onLoadMore={handleLoadMore}
                onCardPress={handleCardPress}
                showTopSection={showTopNgos}
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