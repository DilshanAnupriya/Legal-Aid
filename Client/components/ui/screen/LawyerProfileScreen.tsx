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
import LawyerAdditionalDetails from './LawyerAdditionalDetails';


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
            // Navigation will be handled automatically by AuthNavigator
            // when isAuthenticated becomes false
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
            <StatusBar barStyle="dark-content" backgroundColor={COLOR.light.light} />
            
            {/* Header */}
            <View style={styles.header}>
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
                            <Text style={styles.userTypeText}>Legal Professional</Text>
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

                {/* Professional Information Section */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Professional Information</Text>
                    
                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>First Name *</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.firstName}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, firstName: text }))}
                                placeholder="Enter first name"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.firstName || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Last Name *</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.lastName}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, lastName: text }))}
                                placeholder="Enter last name"
                                placeholderTextColor="#999"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.lastName || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Full Name</Text>
                        <Text style={styles.fieldValue}>
                            {profileData.firstName && profileData.lastName 
                                ? `${profileData.firstName} ${profileData.lastName}`
                                : 'Complete your name above'
                            }
                        </Text>
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Contact Number *</Text>
                        {isEditing ? (
                            <TextInput
                                style={styles.input}
                                value={profileData.contactNumber}
                                onChangeText={(text) => setProfileData(prev => ({ ...prev, contactNumber: text }))}
                                placeholder="Enter contact number"
                                placeholderTextColor="#999"
                                keyboardType="phone-pad"
                            />
                        ) : (
                            <Text style={styles.fieldValue}>{profileData.contactNumber || 'Not set'}</Text>
                        )}
                    </View>

                    <View style={styles.field}>
                        <Text style={styles.fieldLabel}>Specialization *</Text>
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
                            <Text style={styles.fieldValue}>{profileData.specialization || 'Not specified'}</Text>
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
                                    firstName: user?.firstName || '',
                                    lastName: user?.lastName || '',
                                    specialization: user?.specialization || '',
                                    contactNumber: user?.contactNumber || ''
                                });
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>More Details</Text>
                        <LawyerAdditionalDetails lawyerId={user.id} />
                    </View>
                    

                    
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
        backgroundColor: '#8E44AD',
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
    specializationContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    specializationOption: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
        marginBottom: 8,
    },
    selectedSpecializationOption: {
        backgroundColor: '#8E44AD',
        borderColor: '#8E44AD',
    },
    specializationOptionText: {
        fontSize: 14,
        color: '#666',
    },
    selectedSpecializationOptionText: {
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