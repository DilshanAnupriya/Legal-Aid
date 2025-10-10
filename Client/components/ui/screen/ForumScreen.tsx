import React, { useState, useEffect, useRef } from 'react';
import {
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    Pressable,
    TextInput,
    Dimensions,
    StatusBar,
    Platform,
    ActivityIndicator,
    Alert,
    Modal,
    FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import CreatePostModal from '../../modals/CreatePostModal';
import CreatePollModal from '../../modals/CreatePollModal';
import PostDetailModal from '../../modals/PostDetailModal';
import PollCard from '../../cards/PollCard';
import { useAuth } from '../../../context/AuthContext';
import { useTheme } from '../../../context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useTTS } from '../../../hooks/useTTS';
import notificationService, { Notification } from '../../../services/notificationService';

const { width } = Dimensions.get('window');

// Define interfaces for better type safety
interface ForumPost {
    id: string;
    _id?: string;
    title: string;
    author: string;
    replies: number;
    views: number;
    lastActivity: string;
    lastActivityRaw?: string;
    createdAt: string;
    category: string;
    isAnswered: boolean;
    priority: string;
    tags: string[];
    type: 'post' | 'poll';
    // Poll-specific properties
    topic?: string;
    options?: string[];
    votes?: number[];
    voters?: string[];
    totalVotes?: number;
    isAnonymous?: boolean;
    description?: string;
}

const ForumsScreen = () => {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { theme, colors } = useTheme();
    const { speak, isSpeaking, stopSpeaking } = useTTS();
    const scrollViewRef = useRef<ScrollView>(null);
    const [activeCategory, setActiveCategory] = useState('All');
    const [isCreatePostModalVisible, setIsCreatePostModalVisible] = useState(false);
    const [isEditPostModalVisible, setIsEditPostModalVisible] = useState(false);
    const [isPostDetailModalVisible, setIsPostDetailModalVisible] = useState(false);
    const [selectedPost, setSelectedPost] = useState<any>(null);
    const [editingPost, setEditingPost] = useState<any>(null);
    const [forumPosts, setForumPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        totalViews: 0,
        answerRate: 0,
    });
    // Create categories with translated names
    const getTranslatedCategories = () => {
        const categories = [
            { id: 1, name: 'All', translatedName: t('forum.all'), count: 0, icon: '📋' },
            { id: 2, name: 'Family Law', translatedName: t('categories.familyLaw'), count: 0, icon: '👨‍👩‍👧‍👦' },
            { id: 3, name: 'Property Law', translatedName: t('categories.propertyLaw'), count: 0, icon: '🏠' },
            { id: 4, name: 'Employment Law', translatedName: t('categories.employmentLaw'), count: 0, icon: '💼' },
            { id: 5, name: 'Civil Law', translatedName: t('categories.civilLaw'), count: 0, icon: '⚖️' },
            { id: 6, name: 'Criminal Law', translatedName: t('categories.criminalLaw'), count: 0, icon: '🚔' },
        ];
        
        // Calculate 'All' count based on available posts
        const totalLegalCount = forumPosts.length;
        categories[0].count = totalLegalCount;
        
        return categories;
    };

    const [categories, setCategories] = useState(getTranslatedCategories());
    const [trendingTopics, setTrendingTopics] = useState<any[]>([]);
    const [sortOrder, setSortOrder] = useState('Newest');

    // Update categories when language changes
    useEffect(() => {
        setCategories(prevCategories => {
            const translatedCategories = getTranslatedCategories();
            return prevCategories.map((category, index) => {
                // For 'All' category, recalculate count as sum of all legal categories
                if (index === 0) {
                    const totalLegalCount = prevCategories.slice(1).reduce((sum, cat) => sum + cat.count, 0);
                    return {
                        ...category,
                        translatedName: translatedCategories[index].translatedName,
                        count: totalLegalCount
                    };
                }
                return {
                    ...category,
                    translatedName: translatedCategories[index].translatedName
                };
            });
        });
    }, [t]);

    // Helper functions to get translated dropdown values
    const getTranslatedContentType = (type: string) => {
        switch (type) {
            case 'All':
                return t('forum.all');
            case 'Forums':
                return t('forum.forums');
            case 'Polls':
                return t('forum.polls');
            default:
                return type;
        }
    };

    const getTranslatedSortOrder = (order: string) => {
        switch (order) {
            case 'Newest':
                return t('forum.newest');
            case 'Oldest':
                return t('forum.oldest');
            default:
                return order;
        }
    };
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [contentType, setContentType] = useState('All');
    const [showContentTypeDropdown, setShowContentTypeDropdown] = useState(false);
    const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
    const [postToDelete, setPostToDelete] = useState<{id: string, title: string} | null>(null);
    const [isCreatePollModalVisible, setIsCreatePollModalVisible] = useState(false);
    const [isEditPollModalVisible, setIsEditPollModalVisible] = useState(false);
    const [editingPoll, setEditingPoll] = useState<any>(null);
    const [isCreateMenuVisible, setIsCreateMenuVisible] = useState(false);
    const [isViewMenuVisible, setIsViewMenuVisible] = useState(false);
    const [currentViewMode, setCurrentViewMode] = useState('everyone'); // 'everyone', 'viewAll', 'all', 'yourForums', 'yourPolls'
    const [polls, setPolls] = useState<ForumPost[]>([]);
    const [isGridView, setIsGridView] = useState(false);
    const [searchBarText, setSearchBarText] = useState('');
    const [isHeaderSticky, setIsHeaderSticky] = useState(false);
    
    // Notification states
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);

    // Handle scroll to show/hide sticky header
    const handleScroll = (event: any) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        // Show sticky header when scrolled past the main header (approximately 300px)
        setIsHeaderSticky(scrollY > 300);
    };

    // Multiple URL options for different environments
    const getApiUrls = () => {
        if (Platform.OS === 'web') {
            return [
                'http://localhost:3000/api',
                'http://127.0.0.1:3000/api',
            ];
        } else if (Platform.OS === 'android') {
            return [
                'http://10.0.2.2:3000/api',     // Android emulator
                'http://10.4.2.1:3000/api',    // Your computer's IP
                'http://localhost:3000/api',    // Fallback
            ];
        } else {
            // iOS simulator
            return [
                'http://10.4.2.1:3000/api',    // Your computer's IP
                'http://localhost:3000/api',    // iOS simulator
            ];
        }
    };

    const API_URLS = getApiUrls();

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
    const fetchPolls = async () => {
        try {
            console.log('Fetching polls from:', `${BASE_URL}/polls`);

            const response = await fetch(`${BASE_URL}/polls?category=${activeCategory}&search=${searchBarText}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Polls response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Polls response data:', data);

            if (data.success && data.data.polls) {
                // Transform backend poll data to match frontend format
                const transformedPolls = data.data.polls.map((poll: any) => {
                    const transformed = {
                        id: poll._id,
                        _id: poll._id,
                        title: poll.topic, // Map topic to title for consistency
                        topic: poll.topic,
                        options: poll.options,
                        votes: poll.votes,
                        voters: poll.voters,
                        totalVotes: poll.totalVotes,
                        author: poll.author,
                        category: poll.category,
                        isAnonymous: poll.isAnonymous,
                        createdAt: poll.createdAt,
                        lastActivity: formatLastActivity(poll.lastActivity || poll.createdAt),
                        lastActivityRaw: poll.lastActivity || poll.createdAt,
                        type: 'poll', // Add type identifier
                        tags: [], // Empty tags array for consistency
                        replies: 0, // Polls don't have replies
                        views: poll.totalVotes || 0, // Use total votes as views
                        isAnswered: false, // Polls don't have answered state
                        priority: 'medium', // Default priority
                    };
                    console.log('Transformed poll:', transformed);
                    return transformed;
                });
                return transformedPolls;
            } else {
                console.warn('No polls found or invalid response');
                return [];
            }
        } catch (error) {
            console.error('Error fetching polls:', error);
            return [];
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            console.log('Fetching posts from:', `${BASE_URL}/posts`);

            const response = await fetch(`${BASE_URL}/posts?category=${activeCategory}&search=${searchBarText}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
                    lastActivityRaw: post.lastActivity, // Keep raw date for sorting
                    createdAt: post.createdAt, // Keep creation date for sorting
                    category: post.category,
                    isAnswered: post.isAnswered,
                    priority: post.priority,
                    tags: post.tags,
                    type: 'post', // Add type identifier
                }));

                // Fetch polls and combine with posts
                const polls = await fetchPolls();
                const combinedContent = [...transformedPosts, ...polls];
                
                // Sort combined content by creation date (newest first)
                combinedContent.sort((a, b) => {
                    const dateA = new Date(a.createdAt);
                    const dateB = new Date(b.createdAt);
                    return dateB.getTime() - dateA.getTime();
                });

                setForumPosts(combinedContent);
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(
                'Connection Error',
                `Failed to load forum posts. Please check if the backend server is running.\n\nTried URLs: ${API_URLS.join(', ')}\n\nError: ${errorMessage}`,
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
                    setCategories(prevCategories => {
                        const updatedCategories = [
                            { id: 1, name: 'All', translatedName: t('forum.all'), count: 0, icon: '📋' }, // Will be calculated below
                            { id: 2, name: 'Family Law', translatedName: t('categories.familyLaw'), count: 0, icon: '👨‍👩‍👧‍👦' },
                            { id: 3, name: 'Property Law', translatedName: t('categories.propertyLaw'), count: 0, icon: '🏠' },
                            { id: 4, name: 'Employment Law', translatedName: t('categories.employmentLaw'), count: 0, icon: '💼' },
                            { id: 5, name: 'Civil Law', translatedName: t('categories.civilLaw'), count: 0, icon: '⚖️' },
                            { id: 6, name: 'Criminal Law', translatedName: t('categories.criminalLaw'), count: 0, icon: '🚔' },
                        ];

                        // Map backend category counts to frontend categories
                        let totalLegalCategoriesCount = 0;
                        data.data.categoryBreakdown.forEach((cat: any) => {
                            const categoryIndex = updatedCategories.findIndex(c => c.name === cat._id);
                            if (categoryIndex !== -1) {
                                updatedCategories[categoryIndex].count = cat.count;
                                // Sum up counts for legal categories (excluding 'All')
                                if (categoryIndex > 0) {
                                    totalLegalCategoriesCount += cat.count;
                                }
                            }
                        });

                        // Set 'All' category count as the sum of all 5 legal categories
                        updatedCategories[0].count = totalLegalCategoriesCount;

                        return updatedCategories;
                    });
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

    const fetchTrendingTopics = async () => {
        try {
            console.log('Fetching trending topics from:', `${BASE_URL}/posts/trending`);

            const response = await fetch(`${BASE_URL}/posts/trending?limit=4`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Trending topics response:', data);

            if (data.success && data.data && Array.isArray(data.data)) {
                // Use the post data directly since we're now rendering discussion cards
                const validPosts = data.data.filter((post: any) => post && post._id && post.title);
                setTrendingTopics(validPosts);
                console.log('Loaded trending topics:', validPosts.length);
            } else {
                console.warn('Invalid trending topics response:', data);
                setTrendingTopics([]);
            }
        } catch (error) {
            console.error('Error fetching trending topics:', error);
            // Use empty array if trending topics can't be fetched
            setTrendingTopics([]);
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
                // Add a small delay to ensure server has processed the post
                setTimeout(() => {
                    fetchPosts(); // Refresh the posts list
                    fetchStats(); // Refresh stats and categories
                    fetchTrendingTopics(); // Refresh trending topics
                }, 500);
            } else {
                Alert.alert('Error', data.message || 'Failed to create post');
            }
        } catch (error) {
            console.error('Error creating post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(
                'Post Creation Failed',
                `Failed to create post. Please check your connection and try again.\n\nError: ${errorMessage}`,
                [
                    { text: 'Retry', onPress: () => createPost(postData) },
                    { text: 'OK' }
                ]
            );
        }
    };

    const createPoll = async (pollData: any) => {
        try {
            console.log('Creating poll:', pollData);
            console.log('POST URL:', `${BASE_URL}/polls`);

            const response = await fetch(`${BASE_URL}/polls`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pollData),
            });

            console.log('Create poll response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Create poll error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Create poll response data:', data);

            if (data.success) {
                Alert.alert('Success', 'Your poll has been created successfully!');
                // Add a small delay to ensure server has processed the poll
                setTimeout(() => {
                    fetchPosts(); // Refresh the posts list (which will include polls)
                    fetchStats(); // Refresh stats and categories
                }, 500);
            } else {
                Alert.alert('Error', data.message || 'Failed to create poll');
            }
        } catch (error) {
            console.error('Error creating poll:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(
                'Poll Creation Failed',
                `Failed to create poll. Please check your connection and try again.\n\nError: ${errorMessage}`,
                [
                    { text: 'Retry', onPress: () => createPoll(pollData) },
                    { text: 'OK' }
                ]
            );
        }
    };

    const updatePoll = async (pollData: any) => {
        try {
            console.log('Updating poll with data:', pollData);
            console.log('Editing poll full object:', editingPoll);
            console.log('Editing poll ID:', editingPoll?._id);
            
            if (!editingPoll || !editingPoll._id) {
                console.error('No editing poll or poll ID found!');
                Alert.alert('Error', 'No poll selected for editing');
                return;
            }
            
            console.log('PUT URL:', `${BASE_URL}/polls/${editingPoll._id}`);

            const response = await fetch(`${BASE_URL}/polls/${editingPoll._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(pollData),
            });

            console.log('Update poll response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Update poll error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Update poll response data:', data);

            if (data.success) {
                Alert.alert('Success', 'Your poll has been updated successfully!');
                setTimeout(() => {
                    fetchPosts(); // Refresh the posts list
                    fetchStats(); // Refresh stats and categories
                }, 500);
            } else {
                console.error('Poll update failed:', data);
                Alert.alert('Error', data.message || 'Failed to update poll');
            }
        } catch (error) {
            console.error('Error updating poll:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(
                'Poll Update Failed',
                `Failed to update poll. Please check your connection and try again.\n\nError: ${errorMessage}`,
                [
                    { text: 'Retry', onPress: () => updatePoll(pollData) },
                    { text: 'OK' }
                ]
            );
        }
    };

    const deletePoll = async (pollId: string) => {
        try {
            console.log('Deleting poll:', pollId);
            console.log('DELETE URL:', `${BASE_URL}/polls/${pollId}`);

            const response = await fetch(`${BASE_URL}/polls/${pollId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            console.log('Delete poll response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('Delete poll error response:', errorText);
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            console.log('Delete poll response data:', data);

            if (data.success) {
                Alert.alert('Success', 'Poll has been deleted successfully!');
                setTimeout(() => {
                    fetchPosts(); // Refresh the posts list
                    fetchStats(); // Refresh stats and categories
                }, 500);
            } else {
                Alert.alert('Error', data.message || 'Failed to delete poll');
            }
        } catch (error) {
            console.error('Error deleting poll:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(
                'Poll Deletion Failed',
                `Failed to delete poll. Please check your connection and try again.\n\nError: ${errorMessage}`,
                [
                    { text: 'Retry', onPress: () => deletePoll(pollId) },
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
                fetchTrendingTopics(); // Refresh trending topics
                setIsEditPostModalVisible(false);
                setEditingPost(null);
            } else {
                Alert.alert('Error', data.message || 'Failed to update post');
            }
        } catch (error) {
            console.error('Error updating post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert(
                'Post Update Failed',
                `Failed to update post. Please check your connection and try again.\n\nError: ${errorMessage}`,
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
                console.log('Post deleted successfully');
                fetchPosts(); // Refresh the posts list
                fetchStats(); // Refresh stats
                fetchTrendingTopics(); // Refresh trending topics
            } else {
                console.error('Failed to delete post:', data.message);
                // For web compatibility, we could add a toast notification here
                if (Platform.OS === 'web') {
                    console.error('Delete failed:', data.message || 'Failed to delete post');
                } else {
                    Alert.alert('Error', data.message || 'Failed to delete post');
                }
            }
        } catch (error) {
            console.error('Error deleting post:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            
            // For web compatibility, use console.error instead of Alert
            if (Platform.OS === 'web') {
                console.error('Delete failed:', errorMessage);
            } else {
                Alert.alert(
                    'Delete Failed',
                    `Failed to delete post. Please check your connection and try again.\n\nError: ${errorMessage}`,
                    [
                        { text: 'Retry', onPress: () => deletePost(postId, postTitle) },
                        { text: 'OK' }
                    ]
                );
            }
        }
    };

    const handleDeletePost = (postId: string, postTitle: string) => {
        setPostToDelete({ id: postId, title: postTitle });
        setShowDeleteConfirmModal(true);
    };

    const confirmDelete = () => {
        if (postToDelete) {
            // Check if the item to delete is a poll or post
            const itemToDelete = forumPosts.find(item => item.id === postToDelete.id);
            if (itemToDelete && itemToDelete.type === 'poll') {
                deletePoll(postToDelete.id);
            } else {
                deletePost(postToDelete.id, postToDelete.title);
            }
            setShowDeleteConfirmModal(false);
            setPostToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowDeleteConfirmModal(false);
        setPostToDelete(null);
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', `Failed to load post details for editing: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };


    // Helper function to check if current user can edit the post
    const canEditPost = (postAuthor: string) => {
        if (!user?.email) {
            console.log('No user email found');
            return false;
        }
        
        // Get current user's display name (same logic as in CreatePostModal)
        const currentUserDisplayName = user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1);
        
        console.log('Checking edit permissions:');
        console.log('- Post/Poll Author:', postAuthor);
        console.log('- Current User:', currentUserDisplayName);
        console.log('- Can Edit:', postAuthor === currentUserDisplayName && postAuthor !== 'Anonymous User');
        
        // Check if the post author matches current user AND post is not by "Anonymous User"
        // Users cannot edit anonymous posts (even their own) for privacy reasons
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

    const formatRelativeTime = (dateString: string) => {
        const now = new Date().getTime();
        const postTime = new Date(dateString).getTime();
        const diffInSeconds = Math.floor((now - postTime) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        } else if (diffInSeconds < 3600) {
            const minutes = Math.floor(diffInSeconds / 60);
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else if (diffInSeconds < 86400) {
            const hours = Math.floor(diffInSeconds / 3600);
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else {
            const days = Math.floor(diffInSeconds / 86400);
            return `${days} day${days > 1 ? 's' : ''} ago`;
        }
    };

    // Effects
    useEffect(() => {
        fetchPosts();
        fetchStats();
        fetchTrendingTopics();
    }, [activeCategory, searchBarText]);

    // Close dropdown when clicking outside or when component unmounts
    useEffect(() => {
        const handleClickOutside = () => {
            if (showSortDropdown) {
                setShowSortDropdown(false);
            }
            if (showContentTypeDropdown) {
                setShowContentTypeDropdown(false);
            }
        };

        // For web, add click listener to document
        if (Platform.OS === 'web') {
            document.addEventListener('click', handleClickOutside);
            return () => {
                document.removeEventListener('click', handleClickOutside);
            };
        }
    }, [showSortDropdown, showContentTypeDropdown]);

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (user && user.email) {
                try {
                    console.log('========== FRONTEND: FETCHING NOTIFICATIONS ==========');
                    console.log('User email:', user.email);
                    console.log('User object:', user);
                    
                    const userNotifications = await notificationService.getUserNotifications(user.email);
                    console.log('Received notifications:', userNotifications.length);
                    if (userNotifications.length > 0) {
                        console.log('Sample notification:', userNotifications[0]);
                    }
                    setNotifications(userNotifications);
                    
                    const count = await notificationService.getUnreadCount(user.email);
                    console.log('Unread count:', count);
                    setUnreadCount(count);
                    console.log('=====================================================');
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            } else {
                console.log('Cannot fetch notifications - no user or email:', user);
            }
        };

        fetchNotifications();
        // Removed auto-refresh interval - manual refresh only
    }, [user?.email]);

    // Handle notification click
    const handleNotificationClick = async (notification: Notification) => {
        try {
            // Mark as read
            if (!notification.isRead) {
                await notificationService.markAsRead(notification._id);
                setUnreadCount(prev => Math.max(0, prev - 1));
                setNotifications(prev => 
                    prev.map(n => n._id === notification._id ? { ...n, isRead: true } : n)
                );
            }
            
            // Open the post
            const response = await fetch(`${BASE_URL}/posts/${notification.postId}`);
            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    setSelectedPost(data.data);
                    setIsPostDetailModalVisible(true);
                    setIsNotificationModalVisible(false);
                }
            }
        } catch (error) {
            console.error('Error handling notification click:', error);
        }
    };

    // Handle mark all as read
    const handleMarkAllAsRead = async () => {
        if (user && user.email) {
            try {
                await notificationService.markAllAsRead(user.email);
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            } catch (error) {
                console.error('Error marking all as read:', error);
            }
        }
    };

    // Handle clear all notifications
    const handleClearAllNotifications = async () => {
        if (user && user.email) {
            try {
                await notificationService.clearAllNotifications(user.email);
                setNotifications([]);
                setUnreadCount(0);
                Alert.alert('Success', 'All notifications cleared');
            } catch (error) {
                console.error('Error clearing all notifications:', error);
                Alert.alert('Error', 'Failed to clear notifications');
            }
        }
    };

    const filteredPosts = forumPosts.filter((item: ForumPost) => {
        const matchesCategory = activeCategory === 'All' || item.category === activeCategory;
        
        // Content type filter
        const matchesContentType = contentType === 'All' || 
            (contentType === 'Forums' && item.type === 'post') ||
            (contentType === 'Polls' && item.type === 'poll');
        
        // View mode filter - filter by user's content
        const currentUserDisplayName = user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : null;
        
        // View mode filtering logic
        let matchesViewMode;
        if (currentViewMode === 'everyone' || currentViewMode === 'viewAll') {
            matchesViewMode = true; // Show all content from all users
        } else if (!currentUserDisplayName) {
            matchesViewMode = false; // No user logged in, can't show user-specific content
        } else {
            matchesViewMode = 
                (currentViewMode === 'all' && item.author === currentUserDisplayName) || 
                (currentViewMode === 'yourForums' && item.type === 'post' && item.author === currentUserDisplayName) ||
                (currentViewMode === 'yourPolls' && item.type === 'poll' && item.author === currentUserDisplayName);
        }
        
        let matchesSearch = false;
        if (searchBarText.trim() === '') {
            matchesSearch = true; // If no search query, include all items
        } else {
            const query = searchBarText.toLowerCase();
            
            // For posts, check title and tags
            if (item.type === 'post') {
                const titleMatch = item.title ? item.title.toLowerCase().includes(query) : false;
                const tagMatch = item.tags && Array.isArray(item.tags) ? 
                    item.tags.some((tag: string) => tag && tag.toLowerCase().includes(query)) : false;
                matchesSearch = titleMatch || tagMatch;
            }
            // For polls, check topic and options
            else if (item.type === 'poll') {
                const topicMatch = item.topic ? item.topic.toLowerCase().includes(query) : false;
                const optionMatch = item.options && Array.isArray(item.options) ? 
                    item.options.some((option: string) => option && option.toLowerCase().includes(query)) : false;
                matchesSearch = topicMatch || optionMatch;
            }
            // Fallback for items without type
            else {
                const titleMatch = (item.title || item.topic || '').toLowerCase().includes(query);
                const tagMatch = item.tags && Array.isArray(item.tags) ? 
                    item.tags.some((tag: string) => tag && tag.toLowerCase().includes(query)) : false;
                matchesSearch = titleMatch || tagMatch;
            }
        }
        
        return matchesCategory && matchesContentType && matchesViewMode && matchesSearch;
    }).sort((a: ForumPost, b: ForumPost) => {
        // Sort by creation date - use createdAt if available, otherwise lastActivityRaw, otherwise fallback to id
        let dateA, dateB;
        
        // Try to get proper dates
        if (a.createdAt) {
            dateA = new Date(a.createdAt);
        } else if (a.lastActivityRaw) {
            dateA = new Date(a.lastActivityRaw);
        } else {
            // Fallback: use id as string comparison (assuming MongoDB ObjectId or similar)
            dateA = a.id;
        }
        
        if (b.createdAt) {
            dateB = new Date(b.createdAt);
        } else if (b.lastActivityRaw) {
            dateB = new Date(b.lastActivityRaw);
        } else {
            // Fallback: use id as string comparison
            dateB = b.id;
        }
        
        // Handle different data types
        if (dateA instanceof Date && dateB instanceof Date) {
            if (sortOrder === 'Newest') {
                return dateB.getTime() - dateA.getTime(); // Newest first
            } else {
                return dateA.getTime() - dateB.getTime(); // Oldest first
            }
        } else {
            // String comparison fallback
            if (sortOrder === 'Newest') {
                return dateB > dateA ? 1 : -1; // Newest first
            } else {
                return dateA > dateB ? 1 : -1; // Oldest first
            }
        }
    });

    const handleCreatePost = (postData: any) => {
        createPost(postData);
    };

    const handleUpdatePost = (postData: any) => {
        updatePost(postData);
    };

    const handleCreatePoll = async (pollData: any) => {
        await createPoll(pollData);
    };

    const handleUpdatePoll = async (pollData: any) => {
        console.log('handleUpdatePoll called with data:', pollData);
        console.log('editingPoll state:', editingPoll);
        await updatePoll(pollData);
    };

    const handleDeletePoll = (pollId: string, pollTopic: string) => {
        setPostToDelete({id: pollId, title: pollTopic});
        setShowDeleteConfirmModal(true);
    };

    const handleVoteOnPoll = async (pollId: string, optionIndex: number, userId: string) => {
        try {
            // Get voter name from user email
            const voterName = user?.email ? user.email.split('@')[0].charAt(0).toUpperCase() + user.email.split('@')[0].slice(1) : 'Someone';
            const voterEmail = user?.email || userId;
            
            console.log('Voting on poll:', pollId, optionIndex, userId, voterName, voterEmail);
            const response = await fetch(`${BASE_URL}/polls/${pollId}/vote`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    optionIndex, 
                    userId,
                    voterName,
                    voterEmail
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const data = await response.json();
            
            if (data.success) {
                // Refresh posts to show updated poll results
                setTimeout(() => {
                    fetchPosts();
                }, 300);
            } else {
                Alert.alert('Error', data.message || 'Failed to cast vote');
            }
        } catch (error) {
            console.error('Error voting on poll:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Voting Failed', `Failed to cast vote: ${errorMessage}`);
        }
    };

    const openCreatePostModal = () => {
        setIsCreatePostModalVisible(true);
    };

    const closeCreatePostModal = () => {
        setIsCreatePostModalVisible(false);
    };

    const openCreatePollModal = () => {
        setIsCreatePollModalVisible(true);
    };

    const closeCreatePollModal = () => {
        setIsCreatePollModalVisible(false);
    };

    const closeEditPollModal = () => {
        setIsEditPollModalVisible(false);
        setEditingPoll(null);
    };

    const handleEditPoll = (poll: any) => {
        console.log('handleEditPoll called with poll:', poll);
        setEditingPoll(poll);
        setIsEditPollModalVisible(true);
        console.log('Edit poll modal should now be visible');
    };

    const closeEditPostModal = () => {
        setIsEditPostModalVisible(false);
        setEditingPost(null);
    };

    const handlePostPress = async (postId: string) => {
        try {
            // Don't handle clicks for polls - they're already interactive
            const item = forumPosts.find(p => p.id === postId);
            if (item && item.type === 'poll') {
                return; // Do nothing for polls
            }

            setLoading(true);
            console.log('Fetching post details for ID:', postId);

            const response = await fetch(`${BASE_URL}/posts/${postId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
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
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            Alert.alert('Error', `Failed to load post details: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    // Scroll to Recent Discussions section
    const scrollToRecentDiscussions = () => {
        if (scrollViewRef.current) {
            // Scroll to Recent Discussions section (around line 1312 in JSX)
            // Adjust this y value if needed based on actual screen measurements
            scrollViewRef.current.scrollTo({
                y: 1000, // This should scroll to approximately where Recent Discussions starts
                animated: true,
            });
        }
    };

    // Handle speaking forum titles
    const handleSpeakTitle = async (title: string, type: 'forum' | 'poll' = 'forum') => {
        if (isSpeaking) {
            await stopSpeaking();
        } else {
            const textToSpeak = type === 'poll' ? `Poll: ${title}` : `Forum: ${title}`;
            await speak(textToSpeak);
        }
    };

    // Create dynamic styles based on theme
    const styles = createStyles(colors, theme);

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView 
                ref={scrollViewRef}
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={true}
                onScroll={handleScroll}
                scrollEventThrottle={16}
            >
                {/* Modern Header with Gradient Background */}
                <View style={styles.header}>
                    <TouchableOpacity 
                        style={{ position: 'absolute', top: 20, right: 20, zIndex: 10 }}
                        onPress={() => setIsNotificationModalVisible(true)}
                        activeOpacity={0.7}
                    >
                        <View>
                            <Ionicons 
                                name="notifications-outline" 
                                size={28} 
                                color={colors.white || '#FFFFFF'} 
                            />
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    top: -5,
                                    right: -5,
                                    backgroundColor: '#FF3B30',
                                    borderRadius: 10,
                                    minWidth: 20,
                                    height: 20,
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    paddingHorizontal: 5,
                                }}>
                                    <Text style={{
                                        color: '#FFFFFF',
                                        fontSize: 12,
                                        fontWeight: 'bold',
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>{t('forum.title')}</Text>
                        <Text style={styles.headerSubtitle}>{t('forum.subtitle', { defaultValue: 'Connect • Ask • Learn • Grow' })}</Text>
                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.totalPosts}</Text>
                                <Text style={styles.statLabel}>{t('common.posts', { defaultValue: 'Total Posts' })}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{stats.totalViews}</Text>
                                <Text style={styles.statLabel}>{t('common.views', { defaultValue: 'Total Views' })}</Text>
                            </View>
                            <View style={styles.statDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{forumPosts.filter((post: ForumPost) => post.type === 'poll').length}</Text>
                                <Text style={styles.statLabel}>{t('forum.polls', { defaultValue: 'Polls' })}</Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Search Bar with Grid/List View Toggle */}
                <View style={styles.searchBarSection}>
                    <View style={styles.searchBarRow}>
                    <View style={styles.searchBarContainer}>
                        <Ionicons name="search-outline" size={20} color={theme === 'dark' ? colors.primary : '#666'} style={styles.searchBarIcon} />
                        <TextInput
                            style={styles.searchBarInput}
                            placeholder={t('forum.searchPlaceholder', { defaultValue: 'Search discussions...' })}
                            value={searchBarText}
                            onChangeText={setSearchBarText}
                            placeholderTextColor={theme === 'dark' ? colors.darkgray : '#999'}
                            selectionColor={colors.primary}
                        />
                        {searchBarText.length > 0 && (
                            <TouchableOpacity onPress={() => setSearchBarText('')}>
                                <Ionicons name="close-circle-outline" size={20} color={theme === 'dark' ? colors.primary : '#666'} />
                            </TouchableOpacity>
                        )}
                        {/* Grid/List View Toggle */}
                        <View style={styles.viewToggleContainer}>
                            <TouchableOpacity
                                style={[
                                    styles.viewToggleButton,
                                    { backgroundColor: isGridView ? colors.accent : (theme === 'dark' ? colors.white : '#FFFFFF') }
                                ]}
                                onPress={() => setIsGridView(true)}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="grid-outline"
                                    size={18}
                                    color={isGridView ? '#FFFFFF' : (theme === 'dark' ? colors.primary : '#000000')}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[
                                    styles.viewToggleButton,
                                    { backgroundColor: !isGridView ? colors.accent : (theme === 'dark' ? colors.white : '#FFFFFF') }
                                ]}
                                onPress={() => setIsGridView(false)}
                                activeOpacity={0.8}
                            >
                                <Ionicons
                                    name="list-outline"
                                    size={18}
                                    color={!isGridView ? '#FFFFFF' : (theme === 'dark' ? colors.primary : '#000000')}
                                />
                            </TouchableOpacity>
                    </View>
                </View>

                        {/* View Button */}
                    <TouchableOpacity
                            style={styles.viewButton}
                            onPress={() => setIsViewMenuVisible(true)}
                        activeOpacity={0.8}
                    >
                            <Text style={styles.viewButtonText}>{t('forum.view', { defaultValue: 'View' })}</Text>
                    </TouchableOpacity>
                        </View>
                        </View>

                {/* Legal Categories Filter */}
                <View style={styles.categoriesFilterSection}>
                    <FlatList
                        data={categories}
                        renderItem={({ item: category }) => (
                            <TouchableOpacity
                                style={[
                                    styles.categoryFilterButton,
                                    activeCategory === category.name && styles.activeCategoryFilterButton,
                                ]}
                                onPress={() => setActiveCategory(category.name)}
                            >
                                <Text style={[
                                    styles.categoryFilterText,
                                    activeCategory === category.name && styles.activeCategoryFilterText,
                                ]}>
                                    {category.translatedName}
                                </Text>
                            </TouchableOpacity>
                        )}
                        keyExtractor={(category) => category.id.toString()}
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.categoriesFilterContainer}
                    />
                </View>

                {/* Trending Topics */}
                <View style={styles.trendingSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>🔥 {t('forum.trendingTopics')}</Text>
                        <TouchableOpacity onPress={scrollToRecentDiscussions}>
                            <Text style={styles.seeAllText}>{t('common.seeAll', { defaultValue: 'See All' })}</Text>
                        </TouchableOpacity>
                    </View>
                    
                    {/* Trending Discussion Cards - Horizontal Scroll */}
                    {trendingTopics.length > 0 ? (
                        <ScrollView 
                            horizontal 
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.trendingScrollContainer}
                        >
                            {trendingTopics.map((post: any, index: number) => (
                                <TouchableOpacity
                                    key={post._id || index}
                                    style={styles.trendingCard}
                                    onPress={async () => {
                                        console.log('Trending post clicked:', post);
                                        if (post && post._id) {
                                            // Fetch complete post data before opening modal
                                            try {
                                                const response = await fetch(`${BASE_URL}/posts/${post._id}`);
                                                if (response.ok) {
                                                    const data = await response.json();
                                                    if (data.success) {
                                                        setSelectedPost(data.data);
                                                        setIsPostDetailModalVisible(true);
                                                    } else {
                                                        console.error('Failed to fetch post details:', data.message);
                                                        // Fallback to using the trending post data
                                                        setSelectedPost(post);
                                                        setIsPostDetailModalVisible(true);
                                                    }
                                                } else {
                                                    console.error('Failed to fetch post details, using cached data');
                                                    setSelectedPost(post);
                                                    setIsPostDetailModalVisible(true);
                                                }
                                            } catch (error) {
                                                console.error('Error fetching post details:', error);
                                                // Fallback to using the trending post data
                                                setSelectedPost(post);
                                                setIsPostDetailModalVisible(true);
                                            }
                                        } else {
                                            console.error('Invalid post object:', post);
                                        }
                                    }}
                                    activeOpacity={0.8}
                                >
                                    {/* Left Badge Area */}
                                    <View style={styles.trendingLeftBadge} />
                                    
                                    {/* Main Content */}
                                    <View style={styles.trendingContent}>

                                        <Text style={styles.trendingTitle} numberOfLines={2}>
                                            {post.title || 'Untitled'}
                                        </Text>
                                        
                                        <Text style={styles.trendingDescription} numberOfLines={1}>
                                            {post.description || 'No description available'}
                                        </Text>
                                        
                                        {/* Stats Row */}
                                        <View style={styles.trendingStatsRow}>
                                            <View style={styles.trendingStatItem}>
                                                <Text style={styles.trendingStatIcon}>👁️</Text>
                                                <Text style={styles.trendingStatText}>{post.views || 0}</Text>
                                            </View>
                                            <View style={styles.trendingStatItem}>
                                                <Text style={styles.trendingStatIcon}>💬</Text>
                                                <Text style={styles.trendingStatText}>{post.replies || 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    ) : (
                        <View style={styles.emptyTrendingContainer}>
                            <Text style={styles.emptyTrendingText}>No trending discussions yet</Text>
                        </View>
                    )}
                </View>

                {/* Forum Posts with Enhanced Design */}
                <View style={styles.postsSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>{t('forum.recentDiscussions')}</Text>
                        <View style={styles.filterContainer}>
                            <TouchableOpacity 
                                style={styles.contentTypeButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowContentTypeDropdown(!showContentTypeDropdown);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.contentTypeText}>{getTranslatedContentType(contentType)}</Text>
                                <Text style={styles.filterArrow}>▼</Text>
                            </TouchableOpacity>
                            {showContentTypeDropdown && (
                                <View style={styles.contentTypeDropdown}>
                                    <TouchableOpacity 
                                        style={[styles.contentTypeOption, contentType === 'All' && styles.activeContentTypeOption]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setContentType('All');
                                            setShowContentTypeDropdown(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.contentTypeOptionText, contentType === 'All' && styles.activeContentTypeOptionText]}>
                                            {t('forum.all')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.contentTypeOption, contentType === 'Forums' && styles.activeContentTypeOption]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setContentType('Forums');
                                            setShowContentTypeDropdown(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.contentTypeOptionText, contentType === 'Forums' && styles.activeContentTypeOptionText]}>
                                            {t('forum.forums')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.contentTypeOption, contentType === 'Polls' && styles.activeContentTypeOption]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setContentType('Polls');
                                            setShowContentTypeDropdown(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.contentTypeOptionText, contentType === 'Polls' && styles.activeContentTypeOptionText]}>
                                            {t('forum.polls')}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                            <TouchableOpacity 
                                style={styles.filterButton}
                                onPress={(e) => {
                                    e.stopPropagation();
                                    setShowSortDropdown(!showSortDropdown);
                                }}
                                activeOpacity={0.7}
                            >
                                <Text style={styles.filterText}>{getTranslatedSortOrder(sortOrder)}</Text>
                                <Text style={styles.filterArrow}>▼</Text>
                            </TouchableOpacity>
                            {showSortDropdown && (
                                <View style={styles.sortDropdown}>
                                    <TouchableOpacity 
                                        style={[styles.sortOption, sortOrder === 'Newest' && styles.activeSortOption]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setSortOrder('Newest');
                                            setShowSortDropdown(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.sortOptionText, sortOrder === 'Newest' && styles.activeSortOptionText]}>
                                            {t('forum.newest')}
                                        </Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity 
                                        style={[styles.sortOption, sortOrder === 'Oldest' && styles.activeSortOption]}
                                        onPress={(e) => {
                                            e.stopPropagation();
                                            setSortOrder('Oldest');
                                            setShowSortDropdown(false);
                                        }}
                                        activeOpacity={0.7}
                                    >
                                        <Text style={[styles.sortOptionText, sortOrder === 'Oldest' && styles.activeSortOptionText]}>
                                            {t('forum.oldest', { defaultValue: 'Oldest' })}
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                            <Text style={styles.loadingText}>{t('common.loading')}</Text>
                        </View>
                    ) : filteredPosts.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Text style={styles.emptyText}>{t('forum.noResults')}</Text>
                            <Text style={styles.emptySubtext}>{t('forum.noResultsSubtext', { defaultValue: 'Be the first to ask a question or create a poll!' })}</Text>
                        </View>
                    ) : isGridView ? (
                        <ScrollView 
                            showsVerticalScrollIndicator={false}
                            contentContainerStyle={styles.masonryContainer}
                        >
                            <View style={styles.masonryGrid}>
                                {/* Left Column */}
                                <View style={styles.masonryColumn}>
                                    {filteredPosts.filter((_, index) => index % 2 === 0).map((item: ForumPost) => {
                                // Render PollCard for polls
                                if (item.type === 'poll') {
                                    return (
                                                <View key={item.id} style={styles.masonryItem}>
                                            <PollCard
                                                poll={item}
                                                onVote={handleVoteOnPoll}
                                                onEdit={handleEditPoll}
                                                onDelete={handleDeletePoll}
                                                userId={user?.email || user?.id || `anonymous_${Date.now()}`}
                                                canEdit={canEditPost(item.author)}
                                                isGridView={isGridView}
                                            />
                                        </View>
                                    );
                                }
                                
                                // Regular post rendering
                                return (
                                            <View key={item.id} style={styles.masonryItem}>
                                            <TouchableOpacity
                                                style={styles.gridPostCard}
                                                onPress={() => handlePostPress(item.id)}
                                                activeOpacity={0.9}
                                            >
                                                {/* Status Indicator */}
                                                <View style={[styles.gridStatusBar, item.isAnswered ? styles.answeredBar : styles.pendingBar]} />
                                                
                                                {/* Card Content */}
                                                <View style={styles.gridPostContent}>
                                                    <View style={styles.gridTitleContainer}>
                                                        <Text style={styles.gridPostTitle} numberOfLines={2}>{item.title}</Text>
                                                        <TouchableOpacity
                                                            style={styles.gridSpeakerButton}
                                                            onPress={(e) => {
                                                                e.stopPropagation();
                                                                handleSpeakTitle(item.title, 'forum');
                                                            }}
                                                            activeOpacity={0.7}
                                                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                        >
                                                            <Ionicons 
                                                                name={isSpeaking ? "stop-circle" : "volume-high"} 
                                                                size={16} 
                                                                color={colors.primary} 
                                                            />
                                                        </TouchableOpacity>
                                                    </View>
                                                    
                                                    {/* Category Badge */}
                                                    <View style={styles.gridCategoryBadge}>
                                                        <Text style={styles.gridCategoryText}>{item.category}</Text>
                                                    </View>
                                                    
                                                    {/* Author Info */}
                                                    <View style={styles.gridAuthorSection}>
                                                        <View style={styles.gridAvatarPlaceholder}>
                                                            <Text style={styles.gridAvatarText}>{item.author.charAt(0)}</Text>
                                                        </View>
                                                        <View style={styles.gridAuthorDetails}>
                                                            <Text style={styles.gridAuthorName} numberOfLines={1}>{item.author}</Text>
                                                            <Text style={styles.gridPostTime}>{item.lastActivity || 'Just now'}</Text>
                                                        </View>
                                                    </View>
                                                    
                                                    {/* Stats */}
                                                    <View style={styles.gridStatsSection}>
                                                        <View style={styles.gridStatItem}>
                                                            <Text style={styles.gridStatIcon}>💬</Text>
                                                            <Text style={styles.gridStatText}>{item.replies || 0}</Text>
                                                        </View>
                                                        <View style={styles.gridStatItem}>
                                                            <Text style={styles.gridStatIcon}>👁</Text>
                                                            <Text style={styles.gridStatText}>{item.views || 0}</Text>
                                                        </View>
                                                        {item.isAnswered && (
                                                            <View style={styles.gridSolvedBadge}>
                                                                <Text style={styles.gridSolvedIcon}>✓</Text>
                                                            </View>
                                                        )}
                                                    </View>
                                                </View>
                                            </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>

                                {/* Right Column */}
                                <View style={styles.masonryColumn}>
                                    {filteredPosts.filter((_, index) => index % 2 === 1).map((item: ForumPost) => {
                                        // Render PollCard for polls
                                        if (item.type === 'poll') {
                                            return (
                                                <View key={item.id} style={styles.masonryItem}>
                                                    <PollCard
                                                        poll={item}
                                                        onVote={handleVoteOnPoll}
                                                        onEdit={handleEditPoll}
                                                        onDelete={handleDeletePoll}
                                                        userId={user?.email || user?.id || `anonymous_${Date.now()}`}
                                                        canEdit={canEditPost(item.author)}
                                                        isGridView={isGridView}
                                                    />
                                                </View>
                                            );
                                        }
                                        
                                        // Regular post rendering
                                        return (
                                            <View key={item.id} style={styles.masonryItem}>
                                                <TouchableOpacity
                                                    style={styles.gridPostCard}
                                                    onPress={() => handlePostPress(item.id)}
                                                    activeOpacity={0.9}
                                                >
                                                    {/* Status Indicator */}
                                                    <View style={[styles.gridStatusBar, item.isAnswered ? styles.answeredBar : styles.pendingBar]} />
                                                    
                                                    {/* Card Content */}
                                                    <View style={styles.gridPostContent}>
                                                        <View style={styles.gridTitleContainer}>
                                                            <Text style={styles.gridPostTitle} numberOfLines={2}>{item.title}</Text>
                                                            <TouchableOpacity
                                                                style={styles.gridSpeakerButton}
                                                                onPress={(e) => {
                                                                    e.stopPropagation();
                                                                    handleSpeakTitle(item.title, 'forum');
                                                                }}
                                                                activeOpacity={0.7}
                                                                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                                                            >
                                                                <Ionicons 
                                                                    name={isSpeaking ? "stop-circle" : "volume-high"} 
                                                                    size={16} 
                                                                    color={colors.primary} 
                                                                />
                                                            </TouchableOpacity>
                                                        </View>
                                                        
                                                        {/* Category Badge */}
                                                        <View style={styles.gridCategoryBadge}>
                                                            <Text style={styles.gridCategoryText}>{item.category}</Text>
                                                        </View>
                                                        
                                                        {/* Author Info */}
                                                        <View style={styles.gridAuthorSection}>
                                                            <View style={styles.gridAvatarPlaceholder}>
                                                                <Text style={styles.gridAvatarText}>{item.author.charAt(0)}</Text>
                                                            </View>
                                                            <View style={styles.gridAuthorDetails}>
                                                                <Text style={styles.gridAuthorName} numberOfLines={1}>{item.author}</Text>
                                                                <Text style={styles.gridPostTime}>{item.lastActivity || 'Just now'}</Text>
                                                            </View>
                                                        </View>
                                                        
                                                        {/* Stats */}
                                                        <View style={styles.gridStatsSection}>
                                                            <View style={styles.gridStatItem}>
                                                                <Text style={styles.gridStatIcon}>💬</Text>
                                                                <Text style={styles.gridStatText}>{item.replies || 0}</Text>
                                                            </View>
                                                            <View style={styles.gridStatItem}>
                                                                <Text style={styles.gridStatIcon}>👁</Text>
                                                                <Text style={styles.gridStatText}>{item.views || 0}</Text>
                                                            </View>
                                                            {item.isAnswered && (
                                                                <View style={styles.gridSolvedBadge}>
                                                                    <Text style={styles.gridSolvedIcon}>✓</Text>
                                                                </View>
                                                            )}
                                                        </View>
                                                    </View>
                                                </TouchableOpacity>
                                            </View>
                                        );
                                    })}
                                </View>
                            </View>
                        </ScrollView>
                    ) : (
                        <FlatList
                            data={filteredPosts}
                            numColumns={1}
                            key="list"
                            showsVerticalScrollIndicator={false}
                            renderItem={({ item }: { item: ForumPost }) => {
                                // Render PollCard for polls in list view
                                if (item.type === 'poll') {
                                    return (
                                        <PollCard
                                            poll={item}
                                            onVote={handleVoteOnPoll}
                                            onEdit={handleEditPoll}
                                            onDelete={handleDeletePoll}
                                            userId={user?.email || user?.id || `anonymous_${Date.now()}`}
                                            canEdit={canEditPost(item.author)}
                                            isGridView={false}
                                        />
                                    );
                                }
                                
                                // Regular post rendering for list view
                                return (
                                            <TouchableOpacity
                                style={styles.modernPostCard}
                                onPress={() => handlePostPress(item.id)}
                                activeOpacity={0.9}
                            >
                                {/* Status Indicator Bar */}
                                <View style={[styles.statusBar, item.isAnswered ? styles.answeredBar : styles.pendingBar]} />
                                
                                {/* Card Header with Actions */}
                                <View style={styles.modernCardHeaderNoTitle}>
                                    {/* Edit and Delete Buttons */}
                                    <View style={styles.actionButtons}>
                                        {canEditPost(item.author) && (
                                            <>
                                                <TouchableOpacity
                                                    style={styles.modernEditButton}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleEditPost(item);
                                                    }}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Text style={styles.modernEditIcon}>✎</Text>
                                                </TouchableOpacity>
                                                <Pressable
                                                    style={({ pressed }) => [
                                                        styles.modernDeleteButton,
                                                        { opacity: pressed ? 0.7 : 1 }
                                                    ]}
                                                    onPress={(e) => {
                                                        e.stopPropagation();
                                                        handleDeletePost(item.id, item.title);
                                                    }}
                                                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                                >
                                                    <Text style={styles.modernDeleteIcon}>✕</Text>
                                                </Pressable>
                                            </>
                                        )}
                                    </View>
                                </View>

                                {/* Main Content */}
                                <View style={styles.modernCardContent}>
                                    <View style={styles.titleSection}>
                                        <View style={styles.titleWithSpeaker}>
                                            <Text style={styles.modernPostTitle} numberOfLines={2}>{item.title}</Text>
                                            <TouchableOpacity
                                                style={styles.listSpeakerButton}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleSpeakTitle(item.title, 'forum');
                                                }}
                                                activeOpacity={0.7}
                                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                                            >
                                                <Ionicons 
                                                    name={isSpeaking ? "stop-circle" : "volume-high"} 
                                                    size={20} 
                                                    color={colors.primary} 
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        {item.isAnswered && (
                                            <View style={styles.modernAnsweredBadge}>
                                                <Text style={styles.modernAnsweredIcon}>✓</Text>
                                                <Text style={styles.answeredText}>SOLVED</Text>
                                            </View>
                                        )}
                                    </View>

                                    {/* Category and Tags Row */}
                                    <View style={styles.categoryTagsRow}>
                                        <View style={styles.categoryBadge}>
                                            <Text style={styles.categoryText}>{item.category}</Text>
                                        </View>
                                        <View style={styles.tagsContainer}>
                                            {(item.tags || []).slice(0, 2).map((tag: string, index: number) => (
                                                <View key={index} style={styles.modernTagChip}>
                                                    <Text style={styles.modernTagText}>{tag}</Text>
                                                </View>
                                            ))}
                                        </View>
                                    </View>
                                </View>

                                {/* Card Footer */}
                                <View style={styles.modernCardFooter}>
                                    <View style={styles.authorSection}>
                                        <View style={styles.modernAvatarPlaceholder}>
                                            <Text style={styles.modernAvatarText}>{item.author.charAt(0)}</Text>
                                        </View>
                                        <View style={styles.authorDetails}>
                                            <Text style={styles.modernAuthorName}>{item.author}</Text>
                                            <Text style={styles.postTime}>{item.lastActivity || 'Just now'}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.statsSection}>
                                        <View style={styles.statGroup}>
                                            <View style={styles.postStatItem}>
                                                <Text style={styles.modernStatIcon}>💬</Text>
                                                <Text style={styles.modernStatText}>{item.replies || 0}</Text>
                                            </View>
                                            <View style={styles.postStatItem}>
                                                <Text style={styles.modernStatIcon}>👁</Text>
                                                <Text style={styles.modernStatText}>{item.views || 0}</Text>
                                            </View>
                                        </View>
                                    </View>
                                </View>
                            </TouchableOpacity>
                                );
                            }}
                            keyExtractor={(item: ForumPost) => item.id}
                        />
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

            {/* Create Poll Modal */}
            <CreatePollModal
                visible={isCreatePollModalVisible}
                onClose={closeCreatePollModal}
                onSubmit={handleCreatePoll}
            />

            {/* Edit Poll Modal */}
            <CreatePollModal
                visible={isEditPollModalVisible}
                onClose={closeEditPollModal}
                onSubmit={handleUpdatePoll}
                editingPoll={editingPoll}
                isEditMode={true}
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
                    fetchTrendingTopics();
                }}
            />

            {/* Notification Modal */}
            <Modal
                animationType="slide"
                transparent={true}
                visible={isNotificationModalVisible}
                onRequestClose={() => setIsNotificationModalVisible(false)}
            >
                <View style={styles.notificationModalOverlay}>
                    <View style={styles.notificationModalContent}>
                        {/* Header */}
                        <View style={styles.notificationModalHeader}>
                            <Text style={styles.notificationModalTitle}>Notifications</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                {notifications.length > 0 && (
                                    <>
                                        {unreadCount > 0 && (
                                            <TouchableOpacity 
                                                onPress={handleMarkAllAsRead}
                                                style={{ marginRight: 15 }}
                                            >
                                                <Text style={styles.markAllReadText}>Mark all read</Text>
                                            </TouchableOpacity>
                                        )}
                                        <TouchableOpacity 
                                            onPress={handleClearAllNotifications}
                                            style={{ marginRight: 15 }}
                                        >
                                            <Text style={[styles.markAllReadText, { color: '#FF3B30' }]}>Clear all</Text>
                                        </TouchableOpacity>
                                    </>
                                )}
                                <TouchableOpacity onPress={() => setIsNotificationModalVisible(false)}>
                                    <Ionicons name="close" size={24} color={theme === 'dark' ? colors.primary : '#2C3E50'} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Notifications List */}
                        {notifications.length > 0 ? (
                            <FlatList
                                data={notifications}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.notificationItem,
                                            !item.isRead && styles.notificationItemUnread
                                        ]}
                                        onPress={() => handleNotificationClick(item)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.notificationIcon}>
                                            <Ionicons 
                                                name="chatbubble-ellipses" 
                                                size={24} 
                                                color={colors.primary} 
                                            />
                                        </View>
                                        <View style={styles.notificationContent}>
                                            <Text style={styles.notificationText}>
                                                <Text style={styles.notificationSender}>{item.sender}</Text>
                                                {' commented on your post: '}
                                                <Text style={styles.notificationPostTitle}>{item.postTitle}</Text>
                                            </Text>
                                            <Text style={styles.notificationComment} numberOfLines={2}>
                                                {item.commentContent}
                                            </Text>
                                            <Text style={styles.notificationTime}>
                                                {notificationService.formatTimeAgo(item.createdAt)}
                                            </Text>
                                        </View>
                                        {!item.isRead && (
                                            <View style={styles.unreadDot} />
                                        )}
                                    </TouchableOpacity>
                                )}
                                showsVerticalScrollIndicator={false}
                            />
                        ) : (
                            <View style={styles.emptyNotifications}>
                                <Ionicons 
                                    name="notifications-off-outline" 
                                    size={64} 
                                    color={theme === 'dark' ? colors.darkgray : '#CCC'} 
                                />
                                <Text style={styles.emptyNotificationsText}>No notifications yet</Text>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>

            {/* Create Menu Popup */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isCreateMenuVisible}
                onRequestClose={() => setIsCreateMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.createMenuOverlay}
                    activeOpacity={1}
                    onPress={() => setIsCreateMenuVisible(false)}
                >
                    <View style={styles.createMenuContent}>
                        <Text style={styles.createMenuTitle}>{t('forum.createNew', { defaultValue: 'Create New' })}</Text>
                        
                        <TouchableOpacity
                            style={styles.createMenuOption}
                            onPress={() => {
                                setIsCreateMenuVisible(false);
                                openCreatePostModal();
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.createMenuOptionIcon}>
                                <Text style={styles.createMenuOptionEmoji}>❓</Text>
                            </View>
                            <View style={styles.createMenuOptionText}>
                                <Text style={styles.createMenuOptionTitle}>{t('forum.askQuestion', { defaultValue: 'Ask a Question' })}</Text>
                                <Text style={styles.createMenuOptionSubtitle}>{t('forum.askQuestionSubtitle', { defaultValue: 'Get help from the community' })}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createMenuOption}
                            onPress={() => {
                                setIsCreateMenuVisible(false);
                                openCreatePollModal();
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.createMenuOptionIcon}>
                                <Text style={styles.createMenuOptionEmoji}>📊</Text>
                            </View>
                            <View style={styles.createMenuOptionText}>
                                <Text style={styles.createMenuOptionTitle}>{t('forum.addPoll', { defaultValue: 'Add a Poll' })}</Text>
                                <Text style={styles.createMenuOptionSubtitle}>{t('forum.addPollSubtitle', { defaultValue: 'Gather community opinions' })}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* View Menu Popup */}
            <Modal
                animationType="fade"
                transparent={true}
                visible={isViewMenuVisible}
                onRequestClose={() => setIsViewMenuVisible(false)}
            >
                <TouchableOpacity 
                    style={styles.createMenuOverlay}
                    activeOpacity={1}
                    onPress={() => setIsViewMenuVisible(false)}
                >
                    <View style={styles.createMenuContent}>
                        <Text style={styles.createMenuTitle}>{t('forum.viewOptions', { defaultValue: 'View Options' })}</Text>
                        
                        <TouchableOpacity
                            style={styles.createMenuOption}
                            onPress={() => {
                                setIsViewMenuVisible(false);
                                setCurrentViewMode('viewAll');
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.createMenuOptionIcon}>
                                <Text style={styles.createMenuOptionEmoji}>🌐</Text>
                            </View>
                            <View style={styles.createMenuOptionText}>
                                <Text style={styles.createMenuOptionTitle}>{t('forum.viewEveryone', { defaultValue: 'View All' })}</Text>
                                <Text style={styles.createMenuOptionSubtitle}>{t('forum.viewEveryoneSubtitle', { defaultValue: 'Show all posts and polls from everyone' })}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createMenuOption}
                            onPress={() => {
                                setIsViewMenuVisible(false);
                                setCurrentViewMode('yourForums');
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.createMenuOptionIcon}>
                                <Text style={styles.createMenuOptionEmoji}>💭</Text>
                            </View>
                            <View style={styles.createMenuOptionText}>
                                <Text style={styles.createMenuOptionTitle}>{t('forum.viewYourForums', { defaultValue: 'View Your Forums' })}</Text>
                                <Text style={styles.createMenuOptionSubtitle}>{t('forum.viewYourForumsSubtitle', { defaultValue: 'Show only your forum posts' })}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createMenuOption}
                            onPress={() => {
                                setIsViewMenuVisible(false);
                                setCurrentViewMode('yourPolls');
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.createMenuOptionIcon}>
                                <Text style={styles.createMenuOptionEmoji}>📊</Text>
                            </View>
                            <View style={styles.createMenuOptionText}>
                                <Text style={styles.createMenuOptionTitle}>{t('forum.viewYourPolls', { defaultValue: 'View Your Polls' })}</Text>
                                <Text style={styles.createMenuOptionSubtitle}>{t('forum.viewYourPollsSubtitle', { defaultValue: 'Show only your polls' })}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.createMenuOption}
                            onPress={() => {
                                setIsViewMenuVisible(false);
                                setCurrentViewMode('all');
                            }}
                            activeOpacity={0.8}
                        >
                            <View style={styles.createMenuOptionIcon}>
                                <Text style={styles.createMenuOptionEmoji}>📋</Text>
                            </View>
                            <View style={styles.createMenuOptionText}>
                                <Text style={styles.createMenuOptionTitle}>{t('forum.viewAll', { defaultValue: 'View Your Forums and Polls' })}</Text>
                                <Text style={styles.createMenuOptionSubtitle}>{t('forum.viewAllSubtitle', { defaultValue: 'Show all your posts and polls' })}</Text>
                            </View>
                            <Ionicons name="chevron-forward" size={20} color="#7F8C8D" />
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>

            {/* Delete Confirmation Modal */}
            <Modal
                visible={showDeleteConfirmModal}
                transparent={true}
                animationType="fade"
                onRequestClose={cancelDelete}
            >
                <View style={styles.deleteModalOverlay}>
                    <View style={styles.deleteModalContainer}>
                        <Text style={styles.deleteModalTitle}>{t('messages.deletePost', { defaultValue: 'Delete Post' })}</Text>
                        <Text style={styles.deleteModalMessage}>
                            {t('messages.deleteConfirm')} "{postToDelete?.title}"?
                            {'\n\n'}{t('messages.deleteWarning', { defaultValue: 'This action cannot be undone.' })}
                        </Text>
                        <View style={styles.deleteModalButtons}>
                            <TouchableOpacity
                                style={styles.deleteModalCancelButton}
                                onPress={cancelDelete}
                            >
                                <Text style={styles.deleteModalCancelText}>{t('common.cancel')}</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.deleteModalConfirmButton}
                                onPress={confirmDelete}
                            >
                                <Text style={styles.deleteModalConfirmText}>{t('common.delete')}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>


            {/* Sticky Header */}
            {isHeaderSticky && (
                <View style={styles.stickyHeader}>
                    {/* Sticky Search Bar */}
                    <View style={styles.stickySearchBarSection}>
                        <View style={styles.searchBarRow}>
                            <View style={styles.searchBarContainer}>
                                <Ionicons name="search-outline" size={20} color={theme === 'dark' ? colors.primary : '#666'} style={styles.searchBarIcon} />
                                <TextInput
                                    style={styles.searchBarInput}
                                    placeholder={t('forum.searchPlaceholder', { defaultValue: 'Search discussions...' })}
                                    value={searchBarText}
                                    onChangeText={setSearchBarText}
                                    placeholderTextColor={theme === 'dark' ? colors.darkgray : '#999'}
                                    selectionColor={colors.primary}
                                />
                                {searchBarText.length > 0 && (
                                    <TouchableOpacity onPress={() => setSearchBarText('')}>
                                        <Ionicons name="close-circle-outline" size={20} color={theme === 'dark' ? colors.primary : '#666'} />
                                    </TouchableOpacity>
                                )}
                            </View>
                            
                            {/* View Button */}
                            <TouchableOpacity
                                style={styles.viewButton}
                                onPress={() => setIsViewMenuVisible(true)}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.viewButtonText}>{t('forum.view', { defaultValue: 'View' })}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Sticky Categories Filter */}
                    <View style={styles.stickyCategoriesFilter}>
                        <FlatList
                            data={categories}
                            renderItem={({ item: category }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.categoryFilterButton,
                                        activeCategory === category.name && styles.activeCategoryFilterButton,
                                    ]}
                                    onPress={() => setActiveCategory(category.name)}
                                >
                                    <Text style={[
                                        styles.categoryFilterText,
                                        activeCategory === category.name && styles.activeCategoryFilterText,
                                    ]}>
                                        {category.translatedName}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            keyExtractor={(category) => category.id.toString()}
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            contentContainerStyle={styles.categoriesFilterContainer}
                        />
                    </View>
                </View>
            )}

            {/* Floating Action Button */}
            <TouchableOpacity 
                style={styles.floatingActionButton}
                onPress={() => setIsCreateMenuVisible(true)}
                activeOpacity={0.85}
            >
                <Ionicons name="add" size={28} color="#FFFFFF" />
            </TouchableOpacity>
        </SafeAreaView>
    );
};

const createStyles = (colors: any, theme: string) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme === 'dark' ? colors.light : '#F8F9FA',
    },
    // Header Styles
    header: {
        backgroundColor: theme === 'dark' ? colors.secondary : colors.primary,
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
        color: colors.textcol,
        marginBottom: 8,
        textAlign: 'center',
    },
    headerSubtitle: {
        fontSize: 16,
        color: theme === 'dark' ? '#B0B0B0' : '#E8E8E8',
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
    // Search Bar Section
    searchBarSection: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: theme === 'dark' ? colors.light : '#FFFFFF',
    },
    searchBarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    searchBarContainer: {
        flex: 0.97,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderWidth: 1,
        borderColor: theme === 'dark' ? colors.secondary : '#E5E5E5',
        shadowColor: theme === 'dark' ? colors.primary : '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        minWidth: 0,
    },
    viewButton: {
        backgroundColor: colors.primary,
        borderRadius: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
        flexShrink: 0,
    },
    viewButtonText: {
        color: theme === 'dark' ? '#2C3E50' : '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    floatingActionButton: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: colors.accent,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
        zIndex: 1000,
    },
    searchBarIcon: {
        marginRight: 12,
        flexShrink: 0,
    },
    searchBarInput: {
        flex: 1,
        flexShrink: 1,
        fontSize: 16,
        color: theme === 'dark' ? colors.primary : '#1A1A1A',
        backgroundColor: 'transparent',
        borderWidth: 0,
        minWidth: 0,
        ...(Platform.OS === 'web' && {
            outline: 'none',
            boxShadow: 'none',
            border: 'none',
        }),
    },
    viewToggleContainer: {
        flexDirection: 'row',
        marginLeft: 0,
        backgroundColor: theme === 'dark' ? colors.secondary : '#F5F5F5',
        borderRadius: 8,
        padding: 2,
        flexShrink: 0,
    },
    viewToggleButton: {
        width: 36,
        height: 32,
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 1,
    },
    // Categories Filter Section
    categoriesFilterSection: {
        backgroundColor: theme === 'dark' ? colors.light : '#FFFFFF',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? colors.secondary : '#E5E5E5',
    },
    categoriesFilterContainer: {
        paddingHorizontal: 16,
    },
    categoryFilterButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        marginRight: 8,
        borderRadius: 20,
        backgroundColor: theme === 'dark' ? colors.white : '#F0F0F0',
        borderWidth: 1,
        borderColor: theme === 'dark' ? colors.secondary : '#E0E0E0',
    },
    activeCategoryFilterButton: {
        backgroundColor: colors.accent,
        borderColor: colors.primary,
    },
    categoryFilterText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.primary : '#666',
        fontWeight: '500',
    },
    activeCategoryFilterText: {
        color: colors.textcol || '#FFFFFF',
    },
    sectionTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme === 'dark' ? colors.primary : '#2C3E50',
        marginBottom: 15,
        paddingHorizontal: 12,
        flexShrink: 1,
        minWidth: 0,
        flex: 1,
    },
    // Trending Section
    trendingSection: {
        paddingVertical: 30,
        backgroundColor: theme === 'dark' ? colors.light : '#F8F9FA',
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 12,
        marginBottom: 15,
        position: 'relative',
        zIndex: 1,
    },
    seeAllText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },

    // Horizontal Trending Card Styles
    trendingScrollContainer: {
        paddingHorizontal: 15,
        paddingVertical: 5,
    },
    trendingCard: {
        backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
        borderRadius: 12,
        marginRight: 12,
        padding: 0,
        paddingBottom: 0,
        width: 220,
        height: 110,
        shadowColor: theme === 'dark' ? colors.primary : '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme === 'dark' ? colors.secondary : '#E5E5E5',
        overflow: 'hidden',
        flexDirection: 'row',
    },
    trendingBadgeContainer: {
        backgroundColor: colors.accent,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    trendingBadgeContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        width: '100%',
    },
    trendingAuthorSection: {
        flex: 1,
        alignItems: 'flex-start',
    },
    trendingBadgeAuthor: {
        fontSize: 9,
        color: '#FFFFFF',
        fontWeight: '600',
        marginBottom: 2,
    },
    trendingBadgeTime: {
        fontSize: 8,
        color: '#FFE5E5',
        fontWeight: '500',
    },
    trendingBadge: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '800',
        letterSpacing: 0.3,
        textAlign: 'right',
    },
    trendingLeftBadge: {
        width: 8,
        backgroundColor: colors.accent,
        borderTopLeftRadius: 12,
        borderBottomLeftRadius: 12,
    },
    trendingContent: {
        padding: 12,
        paddingBottom: 0,
        flex: 1,
    },

    trendingTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme === 'dark' ? colors.primary : '#2C3E50',
        marginBottom: 6,
        lineHeight: 18,
    },
    trendingDescription: {
        fontSize: 12,
        color: theme === 'dark' ? colors.darkgray : '#5D6D7E',
        lineHeight: 16,
        marginBottom: 8,
        overflow: 'hidden',
    },
    trendingStatsRow: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        marginBottom: 0,
        paddingVertical: 6,
        paddingHorizontal: 8,
        backgroundColor: theme === 'dark' ? colors.secondary : '#F8F9FA',
        borderRadius: 8,
    },
    trendingStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    trendingStatIcon: {
        fontSize: 12,
        marginRight: 3,
    },
    trendingStatText: {
        fontSize: 10,
        color: theme === 'dark' ? colors.primary : '#34495E',
        fontWeight: '600',
    },
    trendingFooter: {
        flexDirection: 'column',
        alignItems: 'flex-start',
        borderTopWidth: 1,
        borderTopColor: '#ECF0F1',
        paddingTop: 8,
    },
    trendingAuthor: {
        fontSize: 10,
        color: '#7F8C8D',
        fontWeight: '500',
        marginBottom: 2,
    },
    trendingTime: {
        fontSize: 9,
        color: '#95A5A6',
        fontStyle: 'italic',
    },
    emptyTrendingContainer: {
        padding: 20,
        alignItems: 'center',
    },
    emptyTrendingText: {
        fontSize: 14,
        color: '#7F8C8D',
        fontStyle: 'italic',
    },
    // Posts Section
    postsSection: {
        paddingTop: 30,
        paddingHorizontal: 12,
        paddingBottom: 20,
        backgroundColor: theme === 'dark' ? colors.light : '#F8F9FA',
        position: 'relative',
        zIndex: 1,
    },
    filterContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        zIndex: 2,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
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
    sortDropdown: {
        position: 'absolute',
        top: 42,
        right: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 120,
        maxWidth: 150,
        zIndex: 9999,
        // Web-specific styles for better shadow
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }),
    },
    sortOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    activeSortOption: {
        backgroundColor: '#F8F9FA',
    },
    sortOptionText: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
    },
    activeSortOptionText: {
        color: colors.primary,
        fontWeight: '600',
    },
    // Content Type Filter Dropdown
    contentTypeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        marginRight: 10,
    },
    contentTypeText: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
        marginRight: 5,
    },
    contentTypeDropdown: {
        position: 'absolute',
        top: 42,
        left: 0,
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E0E0E0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 8,
        minWidth: 120,
        maxWidth: 150,
        zIndex: 9999,
        // Web-specific styles for better shadow
        ...(Platform.OS === 'web' && {
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }),
    },
    contentTypeOption: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#F0F0F0',
    },
    activeContentTypeOption: {
        backgroundColor: '#F8F9FA',
    },
    contentTypeOptionText: {
        fontSize: 14,
        color: '#2C3E50',
        fontWeight: '500',
    },
    activeContentTypeOptionText: {
        color: colors.accent,
        fontWeight: '600',
    },
    // Modern Post Cards Design
    modernPostCard: {
        backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
        borderRadius: 16,
        marginBottom: 16,
        overflow: 'hidden',
        shadowColor: theme === 'dark' ? colors.primary : colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 12,
        elevation: 6,
        borderWidth: 1,
        borderColor: theme === 'dark' ? colors.secondary : '#F0F2FF',
        position: 'relative',
    },
    
    // Status Indicator
    statusBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 4,
        height: '100%',
        zIndex: 1,
    },
    answeredBar: {
        backgroundColor: '#10B981',
    },
    pendingBar: {
        backgroundColor: '#F59E0B',
    },
    
    // Card Header
    modernCardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        marginLeft: 4, // Account for status bar
    },
    modernCardHeaderNoTitle: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingTop: 16,
        paddingBottom: 8,
        marginLeft: 4, // Account for status bar
    },
    actionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modernEditButton: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    modernEditIcon: {
        fontSize: 14,
        color: '#3B82F6',
    },
    modernDeleteButton: {
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        padding: 8,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(239, 68, 68, 0.2)',
        pointerEvents: 'auto',
        ...(Platform.OS === 'web' && {
            cursor: 'pointer',
            userSelect: 'none',
        }),
    },
    modernDeleteIcon: {
        fontSize: 14,
        color: '#EF4444',
        fontWeight: 'bold',
    },
    
    // Card Content
    modernCardContent: {
        paddingHorizontal: 16,
        paddingBottom: 12,
        marginLeft: 4, // Account for status bar
    },
    titleSection: {
        marginBottom: 12,
    },
    modernPostTitle: {
        fontSize: 17,
        fontWeight: '700',
        color: theme === 'dark' ? colors.primary : '#1F2937',
        lineHeight: 24,
        marginBottom: 8,
        flex: 1,
        marginRight: 8,
    },
    modernAnsweredBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#A7F3D0',
        alignSelf: 'flex-start',
    },
    modernAnsweredIcon: {
        fontSize: 12,
        color: '#10B981',
        fontWeight: 'bold',
        marginRight: 4,
    },
    answeredText: {
        fontSize: 10,
        color: '#059669',
        fontWeight: '700',
        letterSpacing: 0.3,
    },
    
    // Category and Tags
    categoryTagsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
    },
    categoryBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    categoryText: {
        fontSize: 11,
        color: '#4F46E5',
        fontWeight: '600',
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        flex: 1,
        justifyContent: 'flex-end',
    },
    modernTagChip: {
        backgroundColor: '#FFF7ED',
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 10,
        marginLeft: 6,
        borderWidth: 1,
        borderColor: '#FED7AA',
    },
    modernTagText: {
        fontSize: 10,
        color: '#EA580C',
        fontWeight: '600',
    },
    
    // Card Footer
    modernCardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 12,
        backgroundColor: theme === 'dark' ? colors.secondary : '#F9FAFB',
        marginLeft: 4, // Account for status bar
        borderTopWidth: 1,
        borderTopColor: theme === 'dark' ? colors.darkgray : '#F3F4F6',
    },
    authorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    modernAvatarPlaceholder: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 10,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
        elevation: 3,
    },
    modernAvatarText: {
        fontSize: 14,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    authorDetails: {
        flex: 1,
    },
    modernAuthorName: {
        fontSize: 13,
        color: theme === 'dark' ? colors.primary : '#1F2937',
        fontWeight: '600',
        marginBottom: 2,
    },
    postTime: {
        fontSize: 11,
        color: theme === 'dark' ? colors.darkgray : '#9CA3AF',
        fontWeight: '500',
    },
    statsSection: {
        alignItems: 'flex-end',
    },
    statGroup: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    postStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? colors.light : '#FFFFFF',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 8,
        shadowColor: theme === 'dark' ? colors.primary : '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    modernStatIcon: {
        fontSize: 14,
        marginRight: 4,
    },
    modernStatText: {
        fontSize: 12,
        color: theme === 'dark' ? colors.primary : '#374151',
        fontWeight: '600',
    },
    bottomSpacing: {
        height: 100,
    },
    // Grid View Styles - Masonry Layout
    masonryContainer: {
        paddingHorizontal: 8,
    },
    masonryGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    masonryColumn: {
        flex: 1,
        paddingHorizontal: 4,
    },
    masonryItem: {
        marginBottom: 12,
    },
    gridPostCard: {
        backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
        borderRadius: 12,
        marginBottom: 0,
        overflow: 'hidden',
        shadowColor: theme === 'dark' ? colors.primary : colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 4,
        borderWidth: 1,
        borderColor: theme === 'dark' ? colors.secondary : '#F0F2FF',
        position: 'relative',
        minHeight: 180,
    },
    gridStatusBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        width: 3,
        height: '100%',
        zIndex: 1,
    },
    gridPostContent: {
        padding: 12,
        marginLeft: 3, // Account for status bar
    },
    gridPostTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: theme === 'dark' ? colors.primary : '#1F2937',
        lineHeight: 18,
        flex: 1,
        marginRight: 6,
        minHeight: 36, // Ensure consistent height
    },
    gridCategoryBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
        marginBottom: 8,
    },
    gridCategoryText: {
        fontSize: 10,
        color: '#4F46E5',
        fontWeight: '600',
    },
    gridAuthorSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    gridAvatarPlaceholder: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 6,
    },
    gridAvatarText: {
        fontSize: 10,
        color: '#FFFFFF',
        fontWeight: '700',
    },
    gridAuthorDetails: {
        flex: 1,
    },
    gridAuthorName: {
        fontSize: 11,
        color: theme === 'dark' ? colors.primary : '#1F2937',
        fontWeight: '600',
    },
    gridPostTime: {
        fontSize: 9,
        color: theme === 'dark' ? colors.darkgray : '#9CA3AF',
        fontWeight: '500',
    },
    gridStatsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    gridStatItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme === 'dark' ? colors.light : '#F8F9FA',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
    },
    gridStatIcon: {
        fontSize: 12,
        marginRight: 3,
    },
    gridStatText: {
        fontSize: 10,
        color: theme === 'dark' ? colors.primary : '#374151',
        fontWeight: '600',
    },
    gridSolvedBadge: {
        backgroundColor: '#ECFDF5',
        paddingHorizontal: 6,
        paddingVertical: 3,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#A7F3D0',
    },
    gridSolvedIcon: {
        fontSize: 10,
        color: '#10B981',
        fontWeight: 'bold',
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
    // Delete Modal Styles
    deleteModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    deleteModalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 24,
        margin: 20,
        maxWidth: 400,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 10,
    },
    deleteModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: 12,
        textAlign: 'center',
    },
    deleteModalMessage: {
        fontSize: 16,
        color: '#34495E',
        lineHeight: 22,
        textAlign: 'center',
        marginBottom: 24,
    },
    deleteModalButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 12,
    },
    deleteModalCancelButton: {
        flex: 1,
        backgroundColor: '#E0E0E0',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteModalCancelText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#666666',
    },
    deleteModalConfirmButton: {
        flex: 1,
        backgroundColor: colors.accent,
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteModalConfirmText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    // Create Menu Styles
    createMenuOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 10000,
    },
    createMenuContent: {
        backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
        borderRadius: 16,
        padding: 20,
        margin: 20,
        maxWidth: 350,
        width: '90%',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 15,
    },
    createMenuTitle: {
        fontSize: 22,
        fontWeight: '700',
        color: theme === 'dark' ? colors.primary : '#2C3E50',
        marginBottom: 20,
        textAlign: 'center',
    },
    createMenuOption: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 16,
        paddingHorizontal: 12,
        backgroundColor: theme === 'dark' ? colors.secondary : '#F8F9FA',
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme === 'dark' ? colors.darkgray : '#E5E5E5',
    },
    createMenuOptionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme === 'dark' ? colors.white : '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    createMenuOptionEmoji: {
        fontSize: 18,
    },
    createMenuOptionText: {
        flex: 1,
    },
    createMenuOptionTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: theme === 'dark' ? colors.primary : '#2C3E50',
        marginBottom: 2,
    },
    createMenuOptionSubtitle: {
        fontSize: 13,
        color: theme === 'dark' ? colors.darkgray : '#7F8C8D',
    },
    // Sticky Header Styles
    stickyHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: theme === 'dark' ? colors.light : '#FFFFFF',
        zIndex: 1000,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 5,
        paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) : 0,
    },
    stickySearchBarSection: {
        paddingHorizontal: 15,
        paddingVertical: 15,
        backgroundColor: theme === 'dark' ? colors.light : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? colors.darkgray : '#E5E5E5',
    },
    stickyCategoriesFilter: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        backgroundColor: theme === 'dark' ? colors.light : '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? colors.darkgray : '#E5E5E5',
    },
    // Speaker Button Styles for Cards
    gridTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    gridSpeakerButton: {
        padding: 4,
        borderRadius: 12,
        backgroundColor: theme === 'dark' ? 'rgba(255, 113, 0, 0.1)' : 'rgba(255, 113, 0, 0.1)',
        marginLeft: 6,
        marginTop: -2,
    },
    titleWithSpeaker: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        flex: 1,
    },
    listSpeakerButton: {
        padding: 6,
        borderRadius: 16,
        backgroundColor: theme === 'dark' ? 'rgba(255, 113, 0, 0.1)' : 'rgba(255, 113, 0, 0.1)',
        marginLeft: 8,
        marginTop: -2,
    },
    // Notification Modal Styles
    notificationModalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    notificationModalContent: {
        backgroundColor: theme === 'dark' ? colors.secondary : '#FFFFFF',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        maxHeight: '80%',
        paddingTop: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    notificationModalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? colors.darkgray : '#E5E5E5',
    },
    notificationModalTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: theme === 'dark' ? colors.primary : '#2C3E50',
    },
    markAllReadText: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
    },
    notificationItem: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: theme === 'dark' ? colors.darkgray : '#F0F0F0',
        backgroundColor: theme === 'dark' ? colors.secondary : '#FFFFFF',
    },
    notificationItemUnread: {
        backgroundColor: theme === 'dark' ? 'rgba(255, 113, 0, 0.1)' : 'rgba(255, 113, 0, 0.05)',
    },
    notificationIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme === 'dark' ? colors.white : '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    notificationContent: {
        flex: 1,
    },
    notificationText: {
        fontSize: 14,
        color: theme === 'dark' ? colors.primary : '#2C3E50',
        marginBottom: 4,
        lineHeight: 20,
    },
    notificationSender: {
        fontWeight: '700',
        color: colors.accent,
    },
    notificationPostTitle: {
        fontWeight: '600',
        color: theme === 'dark' ? colors.primary : '#2C3E50',
    },
    notificationComment: {
        fontSize: 13,
        color: theme === 'dark' ? colors.lightgray : '#666',
        marginBottom: 4,
        fontStyle: 'italic',
    },
    notificationTime: {
        fontSize: 12,
        color: theme === 'dark' ? colors.darkgray : '#999',
    },
    unreadDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#FF3B30',
        marginLeft: 8,
        alignSelf: 'center',
    },
    emptyNotifications: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 60,
    },
    emptyNotificationsText: {
        fontSize: 16,
        color: theme === 'dark' ? colors.darkgray : '#999',
        marginTop: 16,
    },
});

export default ForumsScreen;