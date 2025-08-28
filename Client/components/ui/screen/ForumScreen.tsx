import React, { useState, useEffect } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TextInput,
    Dimensions,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert,
} from 'react-native';
import CreatePostModal from '../../modals/CreatePostModal';
import PostDetailModal from '../../modals/PostDetailModal';
import { useAuth } from '../../../context/AuthContext';

const { width } = Dimensions.get('window');

const ForumsScreen = () => {
    const { user } = useAuth();
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
    const [isEditPostModalVisible, setIsEditPostModalVisible] = useState(false);
    const [isPostDetailModalVisible, setIsPostDetailModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [forumPosts, setForumPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalViews: 0,
        answerRate: 0,
    });
    const [categories, setCategories] = useState([
        { id: 1, name: 'All', count: 0, icon: '📋' },
        { id: 2, name: 'Family Law', count: 0, icon: '👨‍👩‍👧‍👦' },
        { id: 3, name: 'Property Law', count: 0, icon: '🏠' },
        { id: 4, name: 'Employment Law', count: 0, icon: '💼' },
        { id: 5, name: 'Civil Law', count: 0, icon: '⚖️' },
        { id: 6, name: 'Criminal Law', count: 0, icon: '🚔' },
    ]);

    // Multiple URL options for different environments
    const API_URLS = Platform.OS === 'android'
        ? [
            'http://10.0.2.2:3000/api',     // Android emulator
            'http://10.4.2.1:3000/api',    // Your computer's IP
            'http://localhost:3000/api',    // Fallback
        ]
        : [
            'http://10.4.2.1:3000/api',    // Your computer's IP
            'http://localhost:3000/api',    // iOS simulator
        ];

    const [currentApiIndex, setCurrentApiIndex] = useState(0);
    const BASE_URL = API_URLS[currentApiIndex];

    // Try different API URLs if current one fails
    const tryNextApiUrl = () => {
        const nextIndex = (currentApiIndex + 1) % API_URLS.length;
        console.log(`Trying next API URL: ${API_URLS[nextIndex]}`);
        setCurrentApiIndex(nextIndex);
        return nextIndex !== currentApiIndex; // Return false if we've tried all URLs
    };

    // API Functions
    const fetchPosts = async () => {
        try {
            setLoading(true);
            console.log('Fetching posts from:', `${BASE_URL}/posts`);

            const response = await fetch(`${BASE_URL}/posts?category=${activeCategory}&search=${searchQuery}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // @ts-ignore - timeout is supported in React Native
                timeout: 10000, // 10 second timeout
            });

            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Response data:', data);

            if (data.success) {
                // Transform backend data to match frontend format
                const transformedPosts = data.data.posts.map((post: any) => ({
                    id: post._id,
                    title: post.title,
                    author: post.author,
                    replies: post.replies,
                    views: post.views,
                    lastActivity: formatLastActivity(post.lastActivity),
                    category: post.category,
                    isAnswered: post.isAnswered,
                    priority: post.priority,
                    tags: post.tags,
                }));
                setForumPosts(transformedPosts);
            } else {
                throw new Error(data.message || 'Failed to fetch posts');
            }
        } catch (error) {
            console.error('Error fetching posts:', error);

            // Try next API URL if available
            if (tryNextApiUrl()) {
                console.log('Trying next API URL...');
                // Retry with next URL
                return fetchPosts();
            }

            // All URLs failed, show error
            Alert.alert(
                'Connection Error',
                `Failed to load forum posts. Please check if the backend server is running.\n\nTried URLs: ${API_URLS.join(', ')}\n\nError: ${error.message}`,
                [
                    { text: 'Retry', onPress: () => {
                            setCurrentApiIndex(0); // Reset to first URL
                            fetchPosts();
                        }},
                    { text: 'OK' }
                ]
            );
            // Set empty array on error so UI doesn't break
            setForumPosts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            console.log('Fetching stats from:', `${BASE_URL}/posts/stats`);

            const response = await fetch(`${BASE_URL}/posts/stats`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // @ts-ignore - timeout is supported in React Native
                timeout: 10000,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Stats response:', data);

            if (data.success) {
                setStats({
                    totalPosts: data.data.totalPosts || 0,
                    totalViews: data.data.totalViews || 0,
                    answerRate: data.data.answerRate || 0,
                });

                // Update categories with real counts from backend
                if (data.data.categoryBreakdown) {
                    const updatedCategories = [
                        { id: 1, name: 'All', count: data.data.totalPosts || 0, icon: '📋' },
                        { id: 2, name: 'Family Law', count: 0, icon: '👨‍👩‍👧‍👦' },
                        { id: 3, name: 'Property Law', count: 0, icon: '🏠' },
                        { id: 4, name: 'Employment Law', count: 0, icon: '💼' },
                        { id: 5, name: 'Civil Law', count: 0, icon: '⚖️' },
                        { id: 6, name: 'Criminal Law', count: 0, icon: '🚔' },
                    ];

                    // Map backend category counts to frontend categories
                    data.data.categoryBreakdown.forEach((cat: any) => {
                        const categoryIndex = updatedCategories.findIndex(c => c.name === cat._id);
                        if (categoryIndex !== -1) {
                            updatedCategories[categoryIndex].count = cat.count;
                        }
                    });

                    setCategories(updatedCategories);
                }
            }
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Don't show alert for stats errors, just use default values
            setStats({
                totalPosts: 0,
                totalViews: 0,
                answerRate: 0,
            });
        }
    };

    const createPost = async (postData: any) => {
        try {
            console.log('Creating post:', postData);
            console.log('POST URL:', `${BASE_URL}/posts`);

            const response = await fetch(`${BASE_URL}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            console.log('Create post response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create post error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Create post response data:', data);

            if (data.success) {
                Alert.alert('Success', 'Your post has been created successfully!');
                fetchPosts(); // Refresh the posts list
                fetchStats(); // Refresh stats and categories
            } else {
                Alert.alert('Error', data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            Alert.alert(
                'Post Creation Failed',
                `Failed to create post. Please check your connection and try again.\n\nError: ${error.message}`,
                [
                    { text: 'Retry', onPress: () => createPost(postData) },
                    { text: 'OK' }
                ]
            );
        }
    };

    const updatePost = async (postData: any) => {
        try {
            console.log('Updating post:', postData);
            console.log('PUT URL:', `${BASE_URL}/posts/${editingPost._id}`);

            const response = await fetch(`${BASE_URL}/posts/${editingPost._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(postData),
            });

            console.log('Update post response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update post error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Update post response data:', data);

            if (data.success) {
                Alert.alert('Success', 'Your post has been updated successfully!');
                fetchPosts(); // Refresh the posts list
                fetchStats(); // Refresh stats and categories
                setIsEditPostModalVisible(false);
                setEditingPost(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            Alert.alert(
                'Post Update Failed',
                `Failed to update post. Please check your connection and try again.\n\nError: ${error.message}`,
                [
                    { text: 'Retry', onPress: () => updatePost(postData) },
                    { text: 'OK' }
                ]
            );
        }
    };

    const deletePost = async (postId: string, postTitle: string) => {
        try {
            console.log('Deleting post:', postId);

            const response = await fetch(`${BASE_URL}/posts/${postId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Delete post response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete post error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Delete post response data:', data);

            if (data.success) {
                Alert.alert('Success', 'Your post has been deleted successfully!');
                fetchPosts(); // Refresh the posts list
                fetchStats(); // Refresh stats
            } else {
                Alert.alert('Error', data.message || 'Failed to delete post');
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            Alert.alert(
                'Delete Failed',
                `Failed to delete post. Please check your connection and try again.\n\nError: ${error.message}`,
                [
                    { text: 'Retry', onPress: () => deletePost(postId, postTitle) },
                    { text: 'OK' }
                ]
            );
        }
    };

    const handleEditPost = async (post: any) => {
        try {
            setLoading(true);
            console.log('Fetching full post details for editing:', post.id);

            const response = await fetch(`${BASE_URL}/posts/${post.id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // @ts-ignore - timeout is supported in React Native
                timeout: 10000,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                // Set the full post data for editing
                setEditingPost(data.data);
                setIsEditPostModalVisible(true);
            } else {
                throw new Error(data.message || 'Failed to fetch post details');
            }
        } catch (error) {
            console.error('Error fetching post details for editing:', error);
            Alert.alert('Error', `Failed to load post details for editing: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeletePost = (postId: string, postTitle: string) => {
        Alert.alert(
            'Delete Post',
            `Are you sure you want to delete "${postTitle}"?\n\nThis action cannot be undone.`,
            [
                {
                    text: 'Cancel',
                    style: 'cancel',
                },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: () => deletePost(postId, postTitle),
                },
            ]
        );
    };

    // Helper function to check if current user can delete the post
    const canDeletePost = (postAuthor: string) => {
        if (!user?.email) return false;
        
        // Get current user's display name (same logic as in CreatePostModal)
        const currentUserDisplayName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
        
        // Check if the post author matches current user or if post is by "Anonymous User"
        return postAuthor === currentUserDisplayName && postAuthor !== 'Anonymous User';
    };

    const formatLastActivity = (dateString: string) => {
        const now = new Date();
        const activityDate = new Date(dateString);
        const diffInHours = Math.floor((now.getTime() - activityDate.getTime()) / (1000 * 60 * 60));
        const diffInDays = Math.floor(diffInHours / 24);

        if (diffInDays > 0) {
            return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
        } else if (diffInHours > 0) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        } else {
            return 'Just now';
        }
    };

    // Effects
    useEffect(() => {
        fetchPosts();
        fetchStats();
    }, [activeCategory, searchQuery]);



    const trendingTopics = [
        { name: 'Tenant Rights', count: 45 },
        { name: 'Divorce Process', count: 38 },
        { name: 'Employment Issues', count: 32 },
        { name: 'Property Disputes', count: 29 },
    ];

    const filteredPosts = forumPosts.filter((post: any) => {
        const matchesCategory = activeCategory === 'All' || post.category === activeCategory;
        const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    const handleCreatePost = (postData: any) => {
        createPost(postData);
    };

    const handleUpdatePost = (postData: any) => {
        updatePost(postData);
    };

    const openCreatePostModal = () => {
        setIsCreatePostModalVisible(true);
    };

    const closeCreatePostModal = () => {
        setIsCreatePostModalVisible(false);
    };

    const closeEditPostModal = () => {
        setIsEditPostModalVisible(false);
        setEditingPost(null);
    };

    const handlePostPress = async (postId: string) => {
        try {
            setLoading(true);
            console.log('Fetching post details for ID:', postId);

            const response = await fetch(`${BASE_URL}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                // @ts-ignore - timeout is supported in React Native
                timeout: 10000,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setSelectedPost(data.data);
                setIsPostDetailModalVisible(true);
            } else {
                throw new Error(data.message || 'Failed to fetch post details');
            }
        } catch (error) {
            console.error('Error fetching post details:', error);
            Alert.alert('Error', `Failed to load post details: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Modern Header with Gradient Background */}
                <View style={styles.header}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Legal Community</Text>
                        <Text style={styles.headerSubtitle}>Connect • Ask • Learn • Grow</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.totalPosts}</Text>
                                <Text style={styles.statLabel}>Total Posts</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.totalViews}</Text>
                                <Text style={styles.statLabel}>Total Views</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.answerRate}%</Text>
                                <Text style={styles.statLabel}>Answered</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Quick Action Cards */}
                <View style={styles.quickActionsSection}>
                    <TouchableOpacity
                        style={styles.askQuestionCard}
                        onPress={openCreatePostModal}
                        activeOpacity={0.8}
                    >
                        <View style={styles.askQuestionIcon}>
                            <Text style={styles.askQuestionEmoji}>💭</Text>
                        </View>
                        <View style={styles.askQuestionContent}>
                            <Text style={styles.askQuestionTitle}>Ask a Question</Text>
                            <Text style={styles.askQuestionSubtitle}>Get expert legal advice anonymously</Text>
                        </View>
                        <Text style={styles.askQuestionArrow}>→</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.browseCard}
                        activeOpacity={0.8}
                    >
                        <View style={styles.browseIcon}>
                            <Text style={styles.browseEmoji}>📚</Text>
                        </View>
                        <View style={styles.browseContent}>
                            <Text style={styles.browseTitle}>Browse Topics</Text>
                            <Text style={styles.browseSubtitle}>Explore legal categories</Text>
                        </View>
                        <Text style={styles.browseArrow}>→</Text>
                    </TouchableOpacity>
                </View>

                {/* Categories with Icons */}
                <View style={styles.categoriesSection}>
                    <Text style={styles.sectionTitle}>Legal Categories</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoriesContainer}>
                        {categories.map((category) => (
                            <TouchableOpacity
                                key={category.id}
                                style={[
                                    styles.categoryCard,
                                    activeCategory === category.name && styles.activeCategoryCard,
                                ]}
                                onPress={() => setActiveCategory(category.name)}>
                                <Text style={styles.categoryIcon}>{category.icon}</Text>
                                <Text style={[
                                    styles.categoryName,
                                    activeCategory === category.name && styles.activeCategoryName,
                                ]}>{category.name}</Text>
                                <Text style={[
                                    styles.categoryCount,
                                    activeCategory === category.name && styles.activeCategoryCount,
                                ]}>{category.count} posts</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Trending Topics */}
                <View style={styles.trendingSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔥 Trending Topics</Text>
                        <TouchableOpacity>
                            <Text style={styles.seeAllText}>See All</Text>
                        </TouchableOpacity>
                    </View>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {trendingTopics.map((topic, index) => (
                            <TouchableOpacity key={index} style={styles.trendingCard}>
                                <Text style={styles.trendingName}>{topic.name}</Text>
                                <Text style={styles.trendingCount}>{topic.count} discussions</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>

                {/* Enhanced Search Bar */}
                <View style={styles.searchSection}>
                    <View style={styles.searchContainer}>
                        <Text style={styles.searchIcon}>🔍</Text>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search questions, topics, or keywords..."
                            placeholderTextColor="#8E8E93"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        {searchQuery.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchQuery('')}>
                                <Text style={styles.clearIcon}>✕</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                </View>

                {/* Forum Posts with Enhanced Design */}
                <View style={styles.postsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Recent Discussions</Text>
                        <View style={styles.filterContainer}>
                            <TouchableOpacity style={styles.filterButton}>
                                <Text style={styles.filterText}>Latest</Text>
                                <Text style={styles.filterArrow}>▼</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color="#667eea" />
                            <Text style={styles.loadingText}>Loading posts...</Text>
                        </View>
                    ) : filteredPosts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>No posts found</Text>
                            <Text style={styles.emptySubtext}>Be the first to ask a question!</Text>
                        </View>
                    ) : (
                        filteredPosts.map((post: any) => (
                            <TouchableOpacity
                                key={post.id}
                                style={styles.postCard}
                                onPress={() => handlePostPress(post.id)}
                                activeOpacity={0.8}
                            >
                                {/* Priority Indicator and Delete Button */}
                                <View style={styles.topRightContainer}>
                                    <View style={styles.postPriorityIndicator}>
                                        <View style={[
                                            styles.priorityDot,
                                            post.priority === 'high' && styles.highPriority,
                                            post.priority === 'medium' && styles.mediumPriority,
                                            post.priority === 'low' && styles.lowPriority,
                                        ]} />
                                    </View>
                                    
                                    {/* Edit and Delete Buttons - Only show for posts by current user */}
                                    {canDeletePost(post.author) && (
                                        <>
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={(e) => {
                                                    e.stopPropagation(); // Prevent card press
                                                    handleEditPost(post);
                                                }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Text style={styles.editIcon}>✏️</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                style={styles.deleteButton}
                                                onPress={(e) => {
                                                    e.stopPropagation(); // Prevent card press
                                                    handleDeletePost(post.id, post.title);
                                                }}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Text style={styles.deleteIcon}>🗑️</Text>
                                            </TouchableOpacity>
                                        </>
                                    )}
                                </View>

                                {/* Post Header */}
                                <View style={styles.postHeader}>
                                    <View style={styles.postTitleRow}>
                                        <Text style={styles.postTitle} numberOfLines={2}>{post.title}</Text>
                                        {post.isAnswered && (
                                            <View style={styles.answeredBadge}>
                                                <Text style={styles.answeredIcon}>✓</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>

                                {/* Tags */}
                                <View style={styles.postTagsContainer}>
                                    {post.tags.slice(0, 2).map((tag: string, index: number) => (
                                        <View key={index} style={styles.tagChip}>
                                            <Text style={styles.tagText}>#{tag}</Text>
                                        </View>
                                    ))}
                                </View>

                                {/* Post Meta */}
                                <View style={styles.postMeta}>
                                    <View style={styles.postAuthor}>
                                        <View style={styles.avatarPlaceholder}>
                                            <Text style={styles.avatarText}>{post.author.charAt(0)}</Text>
                                        </View>
                                        <Text style={styles.authorName}>{post.author}</Text>
                                    </View>

                                    <View style={styles.postStats}>
                                        <Text style={styles.statIcon}>💬</Text>
                                        <Text style={styles.statText}>{post.replies}</Text>
                                        <Text style={styles.statIcon}>👁</Text>
                                        <Text style={styles.statText}>{post.views}</Text>
                                        <Text style={styles.timeText}>{post.lastActivity}</Text>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                {/* Bottom Spacing */}
                <View style={styles.bottomSpacing} />
            </ScrollView>

            {/* Create Post Modal */}
            <CreatePostModal
                visible={isCreatePostModalVisible}
                onClose={closeCreatePostModal}
                onSubmit={handleCreatePost}
            />

            {/* Edit Post Modal */}
            <CreatePostModal
                visible={isEditPostModalVisible}
                onClose={closeEditPostModal}
                onSubmit={handleUpdatePost}
                editingPost={editingPost}
                isEditMode={true}
            />

            {/* Post Detail Modal */}
            <PostDetailModal
                visible={isPostDetailModalVisible}
                post={selectedPost}
                onClose={() => setIsPostDetailModalVisible(false)}
                onPostUpdated={() => {
                    // Refresh posts and stats when post is updated (reply count changed)
                    fetchPosts();
                    fetchStats();
                }}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // Header Styles
    header: {
        backgroundColor: '#667eea',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 20,
        paddingBottom: 30,
        borderBottomLeftRadius: 25,
        borderBottomRightRadius: 25,
    },
    headerContent: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '800',
        color: '#FFFFFF',
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#E8E8E8',
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: '500',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 15,
        paddingVertical: 15,
        paddingHorizontal: 10,
    },
    statItem: {
        alignItems: 'center',
        flex: 1,
    },
    statNumber: {
        fontSize: 20,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    statLabel: {
        fontSize: 12,
        color: '#E8E8E8',
        marginTop: 2,
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: 'rgba(255, 255, 255, 0.3)',
        alignSelf: 'center',
    },
    // Search Section
    searchSection: {
        paddingHorizontal: 20,
        paddingVertical: 20,
        backgroundColor: '#FFFFFF',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F5F5F5',
        borderRadius: 25,
        paddingHorizontal: 15,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    searchIcon: {
        fontSize: 18,
        marginRight: 10,
        color: '#666666',
    },
    searchInput: {
        flex: 1,
        fontSize: 16,
        color: '#333333',
        fontWeight: '500',
    },
    clearIcon: {
        fontSize: 16,
        color: '#999999',
        marginLeft: 10,
    },
    // Quick Actions
    quickActionsSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: '#FFFFFF',
    },
    askQuestionCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#667eea',
        borderRadius: 20,
        padding: 20,
        marginBottom: 12,
        shadowColor: '#667eea',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    askQuestionIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    askQuestionEmoji: {
        fontSize: 24,
    },
    askQuestionContent: {
        flex: 1,
    },
    askQuestionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    askQuestionSubtitle: {
        fontSize: 14,
        color: '#E8E8E8',
    },
    askQuestionArrow: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    browseCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#764ba2',
        borderRadius: 20,
        padding: 20,
        shadowColor: '#764ba2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    browseIcon: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 15,
    },
    browseEmoji: {
        fontSize: 24,
    },
    browseContent: {
        flex: 1,
    },
    browseTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    browseSubtitle: {
        fontSize: 14,
        color: '#E8E8E8',
    },
    browseArrow: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Categories Section
    categoriesSection: {
        paddingTop: 20,
        paddingBottom: 10,
        backgroundColor: '#F8F9FA',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 15,
        paddingHorizontal: 20,
    },
    categoriesContainer: {
        paddingLeft: 20,
    },
    categoryCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginRight: 12,
        alignItems: 'center',
        minWidth: 100,
        borderWidth: 2,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    activeCategoryCard: {
        backgroundColor: '#667eea',
        borderColor: '#667eea',
    },
    categoryIcon: {
        fontSize: 28,
        marginBottom: 8,
    },
    categoryName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        textAlign: 'center',
        marginBottom: 4,
    },
    activeCategoryName: {
        color: '#FFFFFF',
    },
    categoryCount: {
        fontSize: 12,
        color: '#7F8C8D',
        textAlign: 'center',
    },
    activeCategoryCount: {
        color: '#E8E8E8',
    },
    // Trending Section
    trendingSection: {
        paddingVertical: 20,
        backgroundColor: '#F8F9FA',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 15,
    },
    seeAllText: {
        fontSize: 14,
        color: '#667eea',
        fontWeight: '600',
    },
    trendingCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 15,
        marginLeft: 20,
        marginRight: 5,
        minWidth: 140,
        borderLeftWidth: 4,
        borderLeftColor: '#FF6B6B',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    trendingName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 4,
    },
    trendingCount: {
        fontSize: 12,
        color: '#7F8C8D',
    },
    // Posts Section
    postsSection: {
        paddingTop: 20,
        paddingHorizontal: 20,
        backgroundColor: '#F8F9FA',
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#E0E0E0',
    },
    filterText: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
        marginRight: 5,
    },
    filterArrow: {
        fontSize: 10,
        color: '#7F8C8D',
    },
    // Post Cards - Compact Design
    postCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginBottom: 12,
        padding: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 3,
    },
    postHeader: {
        marginBottom: 8,
    },
    topRightContainer: {
        position: 'absolute',
        top: 12,
        right: 12,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 1,
    },
    postPriorityIndicator: {
        marginRight: 8,
    },
    editButton: {
        backgroundColor: 'rgba(102, 126, 234, 0.1)',
        padding: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(102, 126, 234, 0.3)',
        marginRight: 8,
    },
    editIcon: {
        fontSize: 12,
        color: '#667eea',
    },
    deleteButton: {
        backgroundColor: 'rgba(255, 107, 107, 0.1)',
        padding: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 107, 107, 0.3)',
    },
    deleteIcon: {
        fontSize: 12,
        color: '#FF6B6B',
    },
    priorityDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
    },
    highPriority: {
        backgroundColor: '#FF6B6B',
    },
    mediumPriority: {
        backgroundColor: '#FFD93D',
    },
    lowPriority: {
        backgroundColor: '#6BCF7F',
    },
    postContent: {
        flex: 1,
    },
    postTitleRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 8,
        paddingRight: 20,
    },
    postTitle: {
        fontSize: 15,
        fontWeight: '600',
        color: '#2C3E50',
        flex: 1,
        lineHeight: 20,
    },
    answeredBadge: {
        backgroundColor: '#6BCF7F',
        width: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: 8,
    },
    answeredIcon: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    postTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
    },
    tagChip: {
        backgroundColor: '#F0F0F0',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 8,
        marginRight: 4,
        marginBottom: 2,
    },
    tagText: {
        fontSize: 10,
        color: '#667eea',
        fontWeight: '500',
    },
    postMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    postAuthor: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    avatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#667eea',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    avatarText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    authorName: {
        fontSize: 12,
        color: '#2C3E50',
        fontWeight: '500',
    },
    postStats: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statIcon: {
        fontSize: 12,
        marginRight: 2,
    },
    statText: {
        fontSize: 10,
        color: '#7F8C8D',
        fontWeight: '500',
        marginRight: 8,
    },
    timeText: {
        fontSize: 10,
        color: '#BDC3C7',
    },
    bottomSpacing: {
        height: 100,
    },
    // Loading and Empty States
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    loadingText: {
        fontSize: 16,
        color: '#7F8C8D',
        marginTop: 10,
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 50,
    },
    emptyText: {
        fontSize: 18,
        color: '#2C3E50',
        fontWeight: '600',
        marginBottom: 8,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
    },
});

export default ForumsScreen;