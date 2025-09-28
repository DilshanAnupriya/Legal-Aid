import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    StatusBar,
    ActivityIndicator
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLOR } from '@/constants/ColorPallet';

interface UserProfileScreenProps {
    navigation: any;
}

export default function UserProfileScreen({ navigation }: UserProfileScreenProps) {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        birthday: user?.birthday || '',
        genderSpectrum: user?.genderSpectrum || ''
    });

    const genderOptions = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

    useEffect(() => {
        if (user) {
            setProfileData({
                birthday: user.birthday || '',
                genderSpectrum: user.genderSpectrum || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!profileData.birthday.trim() || !profileData.genderSpectrum.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        setIsLoading(true);
        try {
            await updateProfile(profileData);
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            console.log('[UserProfile] User initiated logout');
            console.log('[UserProfile] Starting logout process...');
            await logout();
            console.log('[UserProfile] Logout completed successfully');
            // Navigation will be handled automatically by AuthNavigator
            // when isAuthenticated becomes false
        } catch (error: any) {
            console.error('[UserProfile] Logout error:', error);
            Alert.alert('Error', error.message || 'Failed to logout');
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Not set';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (!user) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR.light.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLOR.light.light} />
            
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>User Profile</Text>
                <TouchableOpacity
                    style={styles.editButton}
                    onPress={() => isEditing ? handleSave() : setIsEditing(true)}
                    disabled={isLoading}
                >
                    {isLoading ? (
                        <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                        <Text style={styles.editButtonText}>
                            {isEditing ? 'Save' : 'Edit'}
                        </Text>
                    )}
                </TouchableOpacity>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Basic Info Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Information</Text>
                    
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Email</Text>
                        <Text style={styles.fieldValue}>{user.email}</Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>User Type</Text>
                        <View style={styles.userTypeBadge}>
                            <Text style={styles.userTypeText}>Regular User</Text>
                        </View>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Account Status</Text>
                        <View style={[
                            styles.statusBadge,
                            user.status === 'active' && styles.activeStatus
                        ]}>
                            <Text style={styles.statusText}>
                                {user.status?.toUpperCase() || 'PENDING'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Personal Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Personal Information</Text>
                    
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Birthday *</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.birthday}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, birthday: text }))}
                                placeholder="YYYY-MM-DD"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{formatDate(profileData.birthday)}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Gender *</Text>
                        {isEditing ? (
                            <View style={styles.genderContainer}>
                                {genderOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.genderOption,
                                            profileData.genderSpectrum === option && styles.selectedGenderOption
                                        ]}
                                        onPress={() => setProfileData(prev => ({ ...prev, genderSpectrum: option }))}
                                    >
                                        <Text style={[
                                            styles.genderOptionText,
                                            profileData.genderSpectrum === option && styles.selectedGenderOptionText
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.genderSpectrum || 'Not specified'}</Text>
                        )}
                    </View>
                </View>

                {/* Account Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Member Since</Text>
                        <Text style={styles.fieldValue}>
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>

                    {user.updatedAt && (
                        <View style={styles.field}>
                            <Text style={styles.fieldLabel}>Last Updated</Text>
                            <Text style={styles.fieldValue}>
                                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Action Buttons */}
                <View style={styles.actionSection}>
                    {isEditing && (
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setIsEditing(false);
                                setProfileData({
                                    birthday: user?.birthday || '',
                                    genderSpectrum: user?.genderSpectrum || ''
                                });
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity
                        style={styles.logoutButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.logoutButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.light.light,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLOR.light.light,
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: COLOR.light.primary,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: COLOR.light.primary,
    },
    editButton: {
        backgroundColor: COLOR.light.primary,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        minWidth: 60,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    section: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLOR.light.primary,
        marginBottom: 16,
    },
    field: {
        marginBottom: 16,
    },
    fieldLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    fieldValue: {
        fontSize: 16,
        color: '#555',
        paddingVertical: 4,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
    },
    userTypeBadge: {
        backgroundColor: COLOR.light.primary,
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    userTypeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        backgroundColor: '#E74C3C',
        alignSelf: 'flex-start',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
    },
    activeStatus: {
        backgroundColor: '#27AE60',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    genderContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    genderOption: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    selectedGenderOption: {
        backgroundColor: COLOR.light.primary,
        borderColor: COLOR.light.primary,
    },
    genderOptionText: {
        fontSize: 14,
        color: '#666',
    },
    selectedGenderOptionText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    actionSection: {
        marginTop: 20,
        gap: 12,
    },
    cancelButton: {
        backgroundColor: '#6C757D',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    logoutButton: {
        backgroundColor: '#E74C3C',
        paddingVertical: 14,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});