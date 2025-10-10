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
    Dimensions
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLOR } from '@/constants/ColorPallet';
import LawyerAdditionalDetails from './LawyerAdditionalDetails';

const { width } = Dimensions.get('window');

interface LawyerProfileScreenProps {
    navigation: any;
}

export default function LawyerProfileScreen({ navigation }: LawyerProfileScreenProps) {
    const { user, updateProfile, logout } = useAuth();
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        specialization: user?.specialization || '',
        contactNumber: user?.contactNumber || ''
    });

    const specializationOptions = [
        'Criminal Law',
        'Civil Law',
        'Family Law',
        'Corporate Law',
        'Immigration Law',
        'Labor Law',
        'Tax Law',
        'Real Estate Law',
        'Intellectual Property Law',
        'Personal Injury Law',
        'Environmental Law',
        'Human Rights Law'
    ];

    useEffect(() => {
        if (user) {
            setProfileData({
                firstName: user.firstName || '',
                lastName: user.lastName || '',
                specialization: user.specialization || '',
                contactNumber: user.contactNumber || ''
            });
        }
    }, [user]);

    const handleSave = async () => {
        if (!profileData.firstName.trim() || !profileData.lastName.trim() || 
            !profileData.specialization.trim() || !profileData.contactNumber.trim()) {
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
            console.log('[LawyerProfile] User initiated logout');
            console.log('[LawyerProfile] Starting logout process...');
            await logout();
            console.log('[LawyerProfile] Logout completed successfully');
        } catch (error: any) {
            console.error('[LawyerProfile] Logout error:', error);
            Alert.alert('Error', error.message || 'Failed to logout');
        }
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
            <StatusBar barStyle="light-content" backgroundColor={COLOR.light.primary} />

            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
            >
                {/* Header Banner */}
                <View style={styles.headerBanner}>
                    <View style={styles.headerContent}>
                        <Text style={styles.headerTitle}>Lawyer Profile</Text>
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
                </View>

                {/* Basic Info Card with rounded top */}
                <View style={styles.basicInfoContainer}>
                    <View style={styles.profileHeader}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>
                                {user.firstName?.[0] || user.email?.[0] || 'L'}
                            </Text>
                        </View>
                        <View style={styles.nameContainer}>
                            <Text style={styles.fullName}>
                                {profileData.firstName && profileData.lastName 
                                    ? `${profileData.firstName} ${profileData.lastName}`
                                    : 'Complete Your Profile'
                                }
                            </Text>
                            <Text style={styles.specialization}>
                                {profileData.specialization || 'No Specialization'}
                            </Text>
                            <View style={styles.badgeContainer}>
                                <View style={styles.userTypeBadge}>
                                    <Text style={styles.userTypeText}>Legal Professional</Text>
                                </View>
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
                    </View>
                </View>

                {/* Professional Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Professional Information</Text>
                    
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>First Name</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.firstName}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                                placeholder="Enter first name"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{profileData.firstName || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Last Name</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.lastName}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                                placeholder="Enter last name"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.infoValue}>{profileData.lastName || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Specialization</Text>
                        {isEditing ? (
                            <View style={styles.specializationContainer}>
                                {specializationOptions.map((option) => (
                                    <TouchableOpacity
                                        key={option}
                                        style={[
                                            styles.specializationOption,
                                            profileData.specialization === option && styles.selectedSpecializationOption
                                        ]}
                                        onPress={() => setProfileData(prev => ({ ...prev, specialization: option }))}
                                    >
                                        <Text style={[
                                            styles.specializationOptionText,
                                            profileData.specialization === option && styles.selectedSpecializationOptionText
                                        ]}>
                                            {option}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        ) : (
                            <Text style={styles.infoValue}>{profileData.specialization || 'Not specified'}</Text>
                        )}
                    </View>
                </View>

                {/* Contact Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>
                    
                    <View style={styles.contactItem}>
                        <Text style={styles.contactLabel}>Email:</Text>
                        <Text style={styles.contactValue}>{user.email}</Text>
                    </View>

                    <View style={styles.contactItem}>
                        <Text style={styles.contactLabel}>Phone:</Text>
                        {isEditing ? (
                            <TextInput
                                style={[styles.input, styles.contactInput]}
                                value={profileData.contactNumber}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, contactNumber: text }))}
                                placeholder="Enter contact number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.contactValue}>{profileData.contactNumber || 'Not set'}</Text>
                        )}
                    </View>
                </View>

                {/* Account Information Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Account Information</Text>
                    
                    <View style={styles.detailItem}>
                        <Text style={styles.detailLabel}>Member Since:</Text>
                        <Text style={styles.detailValue}>
                            {new Date(user.createdAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </Text>
                    </View>

                    {user.updatedAt && (
                        <View style={styles.detailItem}>
                            <Text style={styles.detailLabel}>Last Updated:</Text>
                            <Text style={styles.detailValue}>
                                {new Date(user.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </Text>
                        </View>
                    )}
                </View>

                {/* Additional Details Section */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>More Details</Text>
                    <LawyerAdditionalDetails lawyerId={user.id} />
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    {isEditing && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={() => {
                                setIsEditing(false);
                                setProfileData({
                                    firstName: user?.firstName || '',
                                    lastName: user?.lastName || '',
                                    specialization: user?.specialization || '',
                                    contactNumber: user?.contactNumber || ''
                                });
                            }}
                        >
                            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    
                    <TouchableOpacity   
                        style={styles.actionButton}
                        onPress={handleLogout}
                    >
                        <Text style={styles.actionButtonText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
        color: '#666',
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 50,
    },
    headerBanner: {
        backgroundColor: COLOR.light.primary,
        paddingTop: 50,
        paddingBottom: 40,
        paddingHorizontal: 16,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    editButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
        minWidth: 70,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    basicInfoContainer: {
        backgroundColor: '#FFFFFF',
        padding: 16,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        marginTop: -20,
        position: 'relative',
        zIndex: 1,
    },
    profileHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLOR.light.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textTransform: 'uppercase',
    },
    nameContainer: {
        flex: 1,
    },
    fullName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    specialization: {
        fontSize: 16,
        color: COLOR.light.primary,
        marginBottom: 8,
    },
    badgeContainer: {
        flexDirection: 'row',
        gap: 8,
        flexWrap: 'wrap',
    },
    userTypeBadge: {
        backgroundColor: '#8E44AD',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    userTypeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    statusBadge: {
        backgroundColor: '#E74C3C',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
    },
    activeStatus: {
        backgroundColor: '#27AE60',
    },
    statusText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: 'bold',
    },
    sectionContainer: {
        backgroundColor: '#FFFFFF',
        marginHorizontal: 16,
        marginVertical: 8,
        padding: 16,
        borderRadius: 12,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 12,
    },
    infoItem: {
        marginBottom: 16,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
    },
    infoValue: {
        fontSize: 16,
        color: '#444',
        lineHeight: 22,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 12,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
        color: '#333',
    },
    specializationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 4,
    },
    specializationOption: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    selectedSpecializationOption: {
        backgroundColor: COLOR.light.primary,
        borderColor: COLOR.light.primary,
    },
    specializationOptionText: {
        fontSize: 14,
        color: '#666',
    },
    selectedSpecializationOptionText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    contactItem: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
        alignItems: 'center',
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        width: 80,
    },
    contactValue: {
        fontSize: 16,
        color: COLOR.light.primary,
        flex: 1,
    },
    contactInput: {
        flex: 1,
        marginLeft: 0,
        paddingVertical: 8,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
    },
    detailLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        width: 130,
    },
    detailValue: {
        fontSize: 16,
        color: '#444',
        flex: 1,
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#E74C3C',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#6C757D',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: '#6C757D',
    },
});