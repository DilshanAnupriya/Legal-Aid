import React, { useState } from 'react';
import { router } from 'expo-router';
import { 
  StyleSheet, 
  Text, 
  View, 
  Pressable, 
  Alert, 
  ActivityIndicator,
  ScrollView,
  RefreshControl
} from "react-native";
import { useAuth } from '../../../context/AuthContext';

export default function ProfileScreen({ navigation }: { navigation?: any }) {
    const { user, logout, getCurrentUser, isLoading } = useAuth();
    const [refreshing, setRefreshing] = useState(false);

    const handleLogout = async () => {
        try {
            await logout();
            router.replace('/auth/login');
        } catch (err) {
            Alert.alert('Error', (err && typeof err === 'object' && 'message' in err) ? (err as any).message : 'Failed to logout');
        }
    };

    const onRefresh = async () => {
        setRefreshing(true);
        try {
            await getCurrentUser();
        } catch (error) {
            // Error refreshing profile
        } finally {
            setRefreshing(false);
        }
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return 'Not specified';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
            });
        } catch {
            return 'Invalid date';
        }
    };

    const formatJoinDate = (dateString?: string): string => {
        if (!dateString) return 'Unknown';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
            });
        } catch {
            return 'Invalid date';
        }
    };

    if (isLoading && !user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#ff6b35" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    if (!user) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>Unable to load profile</Text>
                <Pressable style={styles.retryButton} onPress={onRefresh}>
                    <Text style={styles.retryButtonText}>Retry</Text>
                </Pressable>
            </View>
        );
    }

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
        >
            <View style={styles.header}>
                <Text style={styles.title}>Profile</Text>
            </View>

            <View style={styles.profileCard}>
                <View style={styles.avatarContainer}>
                    <View style={styles.avatarPlaceholder}>
                        <Text style={styles.avatarText}>
                            {user.email.charAt(0).toUpperCase()}
                        </Text>
                    </View>
                </View>
                
                <Text style={styles.email}>{user.email}</Text>
                <Text style={styles.memberSince}>
                    Member since {formatJoinDate(user.createdAt)}
                </Text>
                
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Email:</Text>
                        <Text style={styles.infoValue}>{user.email}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Birthday:</Text>
                        <Text style={styles.infoValue}>{formatDate(user.birthday)}</Text>
                    </View>
                    
                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Gender:</Text>
                        <Text style={styles.infoValue}>{user.genderSpectrum}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.infoLabel}>Account ID:</Text>
                        <Text style={styles.infoValue}>{user.id.slice(-8)}</Text>
                    </View>
                </View>
            </View>

            <Pressable style={styles.logoutButton} onPress={handleLogout}>
                <Text style={styles.logoutButtonText}>Sign Out</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    errorText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 20,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: '#ff6b35',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 20,
        alignItems: 'center',
        marginBottom: 30,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    avatarContainer: {
        marginBottom: 15,
    },
    avatarPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: '#ff6b35',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
    },
    email: {
        fontSize: 18,
        color: '#333',
        fontWeight: '600',
        marginBottom: 5,
    },
    memberSince: {
        fontSize: 14,
        color: '#666',
        marginBottom: 20,
    },
    infoSection: {
        width: '100%',
    },
    infoRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoLabel: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    infoValue: {
        fontSize: 16,
        color: '#666',
        flex: 1,
        textAlign: 'right',
    },
    logoutButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 15,
        paddingHorizontal: 30,
        borderRadius: 8,
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    logoutButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});