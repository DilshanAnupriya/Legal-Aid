import { Image, TouchableOpacity, View, Text, StyleSheet, Modal, FlatList } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import ForumScreen from "@/components/ui/screen/ForumScreen";
import DocumentAnalyseScreen from "../../../components/ui/screen/DocumentAnalyseScreen";
import LawyerScreen from "@/components/ui/screen/LawyerScreen";
import MenuScreen from "@/components/ui/screen/MenuScreen";
import { Ionicons } from "@expo/vector-icons";
import React, { useState, useEffect } from 'react';

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeSwitcherComponent from '../../../components/modals/ThemeSwitcher';
import notificationService, { Notification } from '../../../services/notificationService';

import { COLOR } from "@/constants/ColorPallet";

const DarkLogo = require("../../../assets/images/logo/Law Firm Logo Black and White (1).png");
const WhiteLogo = require("../../../assets/images/logo/img.png");
const Tab = createBottomTabNavigator();

export default function HomeBottomTabNavigation({ navigation }: any) {
    const { colors, theme } = useTheme();
    const { user } = useAuth();
    
    // Notification states
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationModalVisible, setIsNotificationModalVisible] = useState(false);
    
    const navigateToProfile = () => {
        if (!user) return;
        
        switch (user.role) {
            case 'user':
                navigation.navigate('UserProfile');
                break;
            case 'lawyer':
                navigation.navigate('LawyerOwnProfile');
                break;
            case 'ngo':
                navigation.navigate('NgoOwnProfile');
                break;
            default:
                console.log('Unknown user role:', user.role);
        }
    };

    // Fetch notifications
    useEffect(() => {
        const fetchNotifications = async () => {
            if (user && user.email) {
                try {
                    const userNotifications = await notificationService.getUserNotifications(user.email);
                    setNotifications(userNotifications);
                    
                    const count = await notificationService.getUnreadCount(user.email);
                    setUnreadCount(count);
                } catch (error) {
                    console.error('Error fetching notifications:', error);
                }
            }
        };

        fetchNotifications();
        
        // Poll for new notifications every 30 seconds
        const intervalId = setInterval(fetchNotifications, 30000);
        
        return () => clearInterval(intervalId);
    }, [user]);

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
            
            // Close modal and navigate to forum
            setIsNotificationModalVisible(false);
            navigation.navigate('Forum');
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
            } catch (error) {
                console.error('Error clearing all notifications:', error);
            }
        }
    };


    return (
        <>
        <Tab.Navigator
            initialRouteName={'Home'}
            screenOptions={({ route, focused }: any) => ({
                tabBarIcon: ({ color }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Forum') iconName = focused ? 'add' : 'add-outline';
                    else if (route.name === 'Documents') iconName = focused ? 'document' : 'document-outline';
                    else if (route.name === 'Lawyer') iconName = focused ? 'briefcase' : 'briefcase-outline';
                    else if (route.name === 'Menu') iconName = focused ? 'menu' : 'menu-outline';

                    return <Ionicons name={iconName as any} size={22} color={color} />;
                },
                headerStyle: {
                    backgroundColor: colors.white,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    height: 90,
                    borderBottomWidth: 1,
                    borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,

                },
                headerTintColor: colors.primary,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.primary,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    borderTopWidth: 1,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 8,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            })}
        >
            <Tab.Screen
                name={'Home'}
                component={HomePageScreen}
                options={{
                    headerLeft: () => (
                        <View style={styles.headerLeftContainer}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={theme === 'light' ? DarkLogo : WhiteLogo}
                                    resizeMode="contain"
                                    style={styles.logo}
                                />
                            </View>
                        </View>
                    ),
                    headerTitle: '',
                    headerRight: () => (
                        <View style={styles.headerRightContainer}>
                            {/* Search Icon */}
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
                                onPress={() => {
                                    console.log('Search pressed');
                                }}
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={20}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>

                            {/* Theme Switcher */}
                            <View style={styles.themeSwitcherContainer}>
                                <ThemeSwitcherComponent size="small" />
                            </View>

                            {/* Notifications */}
                            <TouchableOpacity
                                style={[
                                    styles.iconButton,
                                    {
                                        backgroundColor:
                                            theme === 'light' ? COLOR.light.white : colors.darkgray,
                                    },
                                ]}
                                onPress={() => setIsNotificationModalVisible(true)}
                            >
                                <Ionicons
                                    name="notifications-outline"
                                    size={20}
                                    color={colors.primary}
                                />
                                {/* Notification badge */}
                                {unreadCount > 0 && (
                                    <View
                                        style={[
                                            styles.notificationBadge,
                                            { backgroundColor: COLOR.light.orange || '#FF6B35' },
                                        ]}
                                    >
                                        <Text style={styles.badgeText}>
                                            {unreadCount > 99 ? '99+' : unreadCount}
                                        </Text>
                                    </View>
                                )}
                            </TouchableOpacity>

                            {/* Profile Menu */}
                            <TouchableOpacity
                                style={[styles.profileButton, {
                                    backgroundColor: theme === 'light' ? COLOR.light.white: colors.darkgray,
                                    borderColor: COLOR.light.orange || '#FF6B35'
                                }]}
                                onPress={navigateToProfile}
                            >
                                <Ionicons
                                    name="person"
                                    size={18}
                                    color={COLOR.light.orange || '#FF6B35'}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}

            />
            <Tab.Screen
                name={'Documents'}
                component={DocumentAnalyseScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Documents',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />

            <Tab.Screen
                name={'Forum'}
                component={ForumScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Legal Forum',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />

            <Tab.Screen
                name={'Lawyer'}
                component={LawyerScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Find Lawyers',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />
            <Tab.Screen
                name={'Menu'}
                component={MenuScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Menu',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />
        </Tab.Navigator>
        
        {/* Notification Modal */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={isNotificationModalVisible}
            onRequestClose={() => setIsNotificationModalVisible(false)}
        >
            <View style={styles.notificationModalOverlay}>
                <View style={[styles.notificationModalContent, { backgroundColor: theme === 'dark' ? colors.secondary : '#FFFFFF' }]}>
                    {/* Header */}
                    <View style={styles.notificationModalHeader}>
                        <Text style={[styles.notificationModalTitle, { color: theme === 'dark' ? colors.primary : '#2C3E50' }]}>
                            Notifications
                        </Text>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            {notifications.length > 0 && (
                                <>
                                    {unreadCount > 0 && (
                                        <TouchableOpacity 
                                            onPress={handleMarkAllAsRead}
                                            style={{ marginRight: 15 }}
                                        >
                                            <Text style={[styles.markAllReadText, { color: colors.accent }]}>
                                                Mark all read
                                            </Text>
                                        </TouchableOpacity>
                                    )}
                                    <TouchableOpacity 
                                        onPress={handleClearAllNotifications}
                                        style={{ marginRight: 15 }}
                                    >
                                        <Text style={[styles.markAllReadText, { color: '#FF3B30' }]}>
                                            Clear all
                                        </Text>
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
                                        { 
                                            backgroundColor: theme === 'dark' ? colors.secondary : '#FFFFFF',
                                            borderBottomColor: theme === 'dark' ? colors.darkgray : '#F0F0F0'
                                        },
                                        !item.isRead && { backgroundColor: theme === 'dark' ? 'rgba(255, 113, 0, 0.1)' : 'rgba(255, 113, 0, 0.05)' }
                                    ]}
                                    onPress={() => handleNotificationClick(item)}
                                    activeOpacity={0.7}
                                >
                                    <View style={[styles.notificationIcon, { backgroundColor: theme === 'dark' ? colors.white : '#F0F0F0' }]}>
                                        <Ionicons 
                                            name="chatbubble-ellipses" 
                                            size={24} 
                                            color={colors.accent} 
                                        />
                                    </View>
                                    <View style={styles.notificationContent}>
                                        <Text style={[styles.notificationText, { color: theme === 'dark' ? colors.primary : '#2C3E50' }]}>
                                            <Text style={[styles.notificationSender, { color: colors.accent }]}>{item.sender}</Text>
                                            {' commented on your post: '}
                                            <Text style={[styles.notificationPostTitle, { color: theme === 'dark' ? colors.primary : '#2C3E50' }]}>
                                                {item.postTitle}
                                            </Text>
                                        </Text>
                                        <Text style={[styles.notificationComment, { color: theme === 'dark' ? '#AAA' : '#666' }]} numberOfLines={2}>
                                            {item.commentContent}
                                        </Text>
                                        <Text style={[styles.notificationTime, { color: theme === 'dark' ? colors.darkgray : '#999' }]}>
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
                            <Text style={[styles.emptyNotificationsText, { color: theme === 'dark' ? colors.darkgray : '#999' }]}>
                                No notifications yet
                            </Text>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingLeft: 16,
    height: 90,
    flex: 1,
    marginBottom: 40,
  },
  logoContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  logo: {
    width: 62,
    height: 72,
  },

  headerRightContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingRight: 16,
    height: 90,
    gap: 20,
    marginBottom: 40,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    elevation: 1,
  },
  themeSwitcherContainer: {
    marginHorizontal: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowRadius: 2,
    elevation: 2,
  },
  badgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
  // Notification Modal Styles
  notificationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  notificationModalContent: {
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
    borderBottomColor: '#E5E5E5',
  },
  notificationModalTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  markAllReadText: {
    fontSize: 14,
    fontWeight: '600',
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
    lineHeight: 20,
  },
  notificationSender: {
    fontWeight: '700',
  },
  notificationPostTitle: {
    fontWeight: '600',
  },
  notificationComment: {
    fontSize: 13,
    marginBottom: 4,
    fontStyle: 'italic',
  },
  notificationTime: {
    fontSize: 12,
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
    marginTop: 16,
  },
});
