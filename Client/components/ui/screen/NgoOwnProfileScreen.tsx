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
    ActivityIndicator,
    Image
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLOR } from '@/constants/ColorPallet';

interface NgoOwnProfileScreenProps {
    navigation: any;
}

export default function NgoOwnProfileScreen({ navigation }: NgoOwnProfileScreenProps) {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        organizationName: user?.organizationName || '',
        description: user?.description || '',
        category: user?.category || '',
        logo: user?.logo || '',
        contact: user?.contact || ''
    });

    const categoryOptions = [
        'Human Rights & Civil Liberties',
        'Women\'s Rights & Gender Justice',
        'Child Protection',
        'Labor & Employment Rights',
        'Refugee & Migrant Rights',
        'LGBTQ+ Rights'
    ];

    useEffect(() => {
        if (user) {
            setProfileData({
                organizationName: user.organizationName || '',
                description: user.description || '',
                category: user.category || '',
                logo: user.logo || '',
                contact: user.contact || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!profileData.organizationName.trim() || !profileData.description.trim() || 
            !profileData.category.trim() || !profileData.contact.trim()) {
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
            console.log('[NgoProfile] User initiated logout');
            console.log('[NgoProfile] Starting logout process...');
            await logout();
            console.log('[NgoProfile] Logout completed successfully');
            // Navigation will be handled automatically by AuthNavigator
            // when isAuthenticated becomes false
        } catch (error: any) {
            console.error('[NgoProfile] Logout error:', error);
            Alert.alert('Error', error.message || 'Failed to logout');
        }
    };

    const renderRating = () => {
        const rating = user?.rating || 0;
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            stars.push(
                <Text key={i} style={[styles.star, i <= rating && styles.activeStar]}>
                    ★
                </Text>
            );
        }

        return (
            <View style={styles.ratingContainer}>
                <View style={styles.starsContainer}>
                    {stars}
                </View>
                <Text style={styles.ratingText}>({rating}/5)</Text>
            </View>
        );
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
                <Text style={styles.headerTitle}>NGO Profile</Text>
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
                            <Text style={styles.userTypeText}>Non-Governmental Organization</Text>
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

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Organization Rating</Text>
                        {renderRating()}
                    </View>
                </View>

                {/* Organization Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Organization Information</Text>
                    
                    {profileData.logo && !isEditing && (
                        <View style={styles.logoContainer}>
                            <Image source={{ uri: profileData.logo }} style={styles.logo} />
                        </View>
                    )}

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Organization Name *</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.organizationName}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, organizationName: text }))}
                                placeholder="Enter organization name"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.organizationName || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Description *</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={profileData.description}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, description: text }))}
                                placeholder="Describe your organization's mission and activities"
                                placeholderTextColor="#999"
                                multiline
                                numberOfLines={4}
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.description || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Contact Information *</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.contact}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, contact: text }))}
                                placeholder="Enter contact number or email"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.contact || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Logo URL</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.logo}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, logo: text }))}
                                placeholder="Enter logo URL (optional)"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.logo || 'No logo set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Category *</Text>
                        {isEditing ? (
                            <View style={styles.categoryContainer}>
                                {categoryOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.categoryOption,
                                            profileData.category === option && styles.selectedCategoryOption
                                        ]}
                                        onPress={() => setProfileData(prev => ({ ...prev, category: option }))}
                                    >
                                        <Text style={[
                                            styles.categoryOptionText,
                                            profileData.category === option && styles.selectedCategoryOptionText
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.category || 'Not specified'}</Text>
                        )}
                    </View>
                </View>

                {/* Account Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Registered Since</Text>
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
                                    organizationName: user?.organizationName || '',
                                    description: user?.description || '',
                                    category: user?.category || '',
                                    logo: user?.logo || '',
                                    contact: user?.contact || ''
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
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    logoContainer: {
        alignItems: 'center',
        marginBottom: 16,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
    },
    userTypeBadge: {
        backgroundColor: '#16A085',
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
    ratingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    starsContainer: {
        flexDirection: 'row',
        marginRight: 8,
    },
    star: {
        fontSize: 18,
        color: '#E9ECEF',
    },
    activeStar: {
        color: '#FFD700',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    categoryOption: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    selectedCategoryOption: {
        backgroundColor: '#16A085',
        borderColor: '#16A085',
    },
    categoryOptionText: {
        fontSize: 14,
        color: '#666',
    },
    selectedCategoryOptionText: {
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