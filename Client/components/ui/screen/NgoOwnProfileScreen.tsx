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
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '@/context/AuthContext';
import { COLOR } from '@/constants/ColorPallet';
import ngoService from '@/service/ngo/NgoService';

interface NgoOwnProfileScreenProps {
    navigation: any;
}

export default function NgoOwnProfileScreen({ navigation }: NgoOwnProfileScreenProps) {
    const { user, updateProfile, logout } = useAuth();
    const [activeTab, setActiveTab] = useState('basic');
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [ngoData, setNgoData] = useState<any>(null);
    const [profileData, setProfileData] = useState({
        organizationName: '',
        description: '',
        category: '',
        logo: '',
        contact: '',
        images: [] as string[]
    });
    const [newLogo, setNewLogo] = useState<string | null>(null);
    const [newImages, setNewImages] = useState<string[]>([]);
    const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: '👤' },
        { id: 'organization', label: 'Organization', icon: '🏢' },
        { id: 'gallery', label: 'Gallery', icon: '🖼️' },
        { id: 'account', label: 'Account', icon: '⚙️' }
    ];

    const categoryOptions = [
        'Human Rights & Civil Liberties',
        'Women\'s Rights & Gender Justice',
        'Child Protection',
        'Labor & Employment Rights',
        'Refugee & Migrant Rights',
        'LGBTQ+ Rights'
    ];

    useEffect(() => {
        fetchNgoData();
    }, [user]);

    const fetchNgoData = async () => {
        if (!user?.email) return;

        try {
            setIsLoading(true);
            const response = await ngoService.getNgoByEmail(user.email);
            if (response.success) {
                setNgoData(response.data);
                setProfileData({
                    organizationName: response.data.name || user.organizationName || '',
                    description: response.data.description || user.description || '',
                    category: response.data.category || user.category || '',
                    logo: response.data.logo || user.logo || '',
                    contact: response.data.contact || user.contact || '',
                    images: response.data.images || []
                });
            }
        } catch (error) {
            console.error('Error fetching NGO data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImagePick = async (type: 'logo' | 'gallery') => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (status !== 'granted') {
                Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsEditing: type === 'logo',
                aspect: type === 'logo' ? [1, 1] : undefined,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const imageUri = result.assets[0].uri;

                if (type === 'logo') {
                    setNewLogo(imageUri);
                    setProfileData(prev => ({ ...prev, logo: imageUri }));
                } else {
                    setNewImages(prev => [...prev, imageUri]);
                    setProfileData(prev => ({
                        ...prev,
                        images: [...prev.images, imageUri]
                    }));
                }
            }
        } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Error', 'Failed to pick image');
        }
    };

    const handleRemoveImage = (imageUrl: string, index: number) => {
        Alert.alert(
            'Remove Image',
            'Are you sure you want to remove this image?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        // Check if it's an existing Cloudinary image
                        if (imageUrl.startsWith('https://res.cloudinary.com')) {
                            setImagesToDelete(prev => [...prev, imageUrl]);
                        } else {
                            // Remove from new images array
                            setNewImages(prev => prev.filter(img => img !== imageUrl));
                        }

                        // Remove from display
                        setProfileData(prev => ({
                            ...prev,
                            images: prev.images.filter((_, i) => i !== index)
                        }));
                    }
                }
            ]
        );
    };

    const handleSave = async () => {
        if (!profileData.organizationName.trim() || !profileData.description.trim() ||
            !profileData.category.trim() || !profileData.contact.trim()) {
            Alert.alert('Error', 'Please fill in all required fields');
            return;
        }

        if (!ngoData?._id) {
            Alert.alert('Error', 'NGO ID not found');
            return;
        }

        setIsLoading(true);
        try {
            // 1. Update basic profile information in User collection
            await updateProfile({
                organizationName: profileData.organizationName,
                description: profileData.description,
                category: profileData.category,
                contact: profileData.contact
            });

            // 2. Update NGO basic info (text fields only)
            await ngoService.updateNgo(ngoData._id, {
                name: profileData.organizationName,
                description: profileData.description,
                category: profileData.category,
                contact: profileData.contact
            });

            // 3. Handle logo upload separately if there's a new logo
            if (newLogo) {
                const logoFormData = new FormData();
                const logoResponse = await fetch(newLogo);
                const logoBlob = await logoResponse.blob();
                logoFormData.append('logo', logoBlob, 'logo.jpg');

                await ngoService.uploadNgoLogo(ngoData._id, logoFormData);
                console.log('Logo uploaded successfully');
            }

            // 4. Handle new gallery images upload
            if (newImages.length > 0) {
                const imagesFormData = new FormData();

                for (let i = 0; i < newImages.length; i++) {
                    const imgResponse = await fetch(newImages[i]);
                    const imgBlob = await imgResponse.blob();
                    imagesFormData.append('images', imgBlob, `image_${i}.jpg`);
                }

                await ngoService.uploadNgoImages(ngoData._id, imagesFormData);
                console.log(`${newImages.length} images uploaded successfully`);
            }

            // 5. Handle image deletions
            for (const imageUrl of imagesToDelete) {
                await ngoService.deleteNgoImage(ngoData._id, imageUrl);
                console.log('Image deleted:', imageUrl);
            }

            // Reset temporary states
            setNewLogo(null);
            setNewImages([]);
            setImagesToDelete([]);

            // Refresh data
            await fetchNgoData();
            setIsEditing(false);
            Alert.alert('Success', 'Profile updated successfully');
        } catch (error: any) {
            console.error('Save error:', error);
            Alert.alert('Error', error.message || 'Failed to update profile');
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAllImages = async () => {
        if (!ngoData?._id) return;

        Alert.alert(
            'Delete All Images',
            'Are you sure you want to delete all gallery images? This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete All',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setIsLoading(true);
                            await ngoService.deleteAllNgoImages(ngoData._id);
                            await fetchNgoData();
                            Alert.alert('Success', 'All images deleted successfully');
                        } catch (error: any) {
                            console.error('Delete all images error:', error);
                            Alert.alert('Error', error.message || 'Failed to delete images');
                        } finally {
                            setIsLoading(false);
                        }
                    }
                }
            ]
        );
    };

    const handleLogout = async () => {
        try {
            console.log('[NgoProfile] User initiated logout');
            await logout();
            console.log('[NgoProfile] Logout completed successfully');
        } catch (error: any) {
            console.error('[NgoProfile] Logout error:', error);
            Alert.alert('Error', error.message || 'Failed to logout');
        }
    };

    const renderRating = () => {
        const rating = ngoData?.rating || 0;
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
                <Text style={styles.ratingText}>({rating.toFixed(1)}/5)</Text>
            </View>
        );
    };

    const renderBasicInfo = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Email Address</Text>
                <Text style={styles.cardValue}>{user?.email || 'Not available'}</Text>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Organization Type</Text>
                <View style={styles.typeBadge}>
                    <Text style={styles.userTypeText}>Non-Governmental Organization</Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Account Status</Text>
                <View style={[
                    styles.statusBadge,
                    ngoData?.status === 'active' && styles.activeStatus
                ]}>
                    <Text style={styles.statusText}>
                        {ngoData?.status?.toUpperCase() || 'PENDING'}
                    </Text>
                </View>
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Organization Rating</Text>
                {renderRating()}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Total Reviews</Text>
                <Text style={styles.cardValue}>Coming soon</Text>
            </View>
        </View>
    );

    const renderOrganizationInfo = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Organization Name *</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={profileData.organizationName}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, organizationName: text }))}
                        placeholder="Enter organization name"
                        placeholderTextColor="#999"
                    />
                ) : (
                    <Text style={styles.cardValue}>{profileData.organizationName || 'Not set'}</Text>
                )}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Description *</Text>
                {isEditing ? (
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={profileData.description}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, description: text }))}
                        placeholder="Describe your organization's mission"
                        placeholderTextColor="#999"
                        multiline
                        numberOfLines={4}
                    />
                ) : (
                    <Text style={styles.cardValueMultiline}>{profileData.description || 'Not set'}</Text>
                )}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Contact Information *</Text>
                {isEditing ? (
                    <TextInput
                        style={styles.input}
                        value={profileData.contact}
                        onChangeText={(text) => setProfileData(prev => ({ ...prev, contact: text }))}
                        placeholder="Enter contact number or email"
                        placeholderTextColor="#999"
                    />
                ) : (
                    <Text style={styles.cardValue}>{profileData.contact || 'Not set'}</Text>
                )}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Logo</Text>
                {isEditing ? (
                    <View>
                        {profileData.logo ? (
                            <View style={styles.logoPreviewContainer}>
                                <Image source={{ uri: profileData.logo }} style={styles.logoPreview} />
                                <TouchableOpacity
                                    style={styles.changeLogoButton}
                                    onPress={() => handleImagePick('logo')}
                                >
                                    <Text style={styles.changeLogoText}>Change Logo</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <TouchableOpacity
                                style={styles.uploadButton}
                                onPress={() => handleImagePick('logo')}
                            >
                                <Text style={styles.uploadButtonText}>📷 Upload Logo</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    <View>
                        {profileData.logo ? (
                            <Image source={{ uri: profileData.logo }} style={styles.logoPreview} />
                        ) : (
                            <Text style={styles.cardValue}>No logo set</Text>
                        )}
                    </View>
                )}
            </View>

            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Category *</Text>
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
                    <Text style={styles.cardValue}>{profileData.category || 'Not specified'}</Text>
                )}
            </View>
        </View>
    );

    const renderGallery = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <View style={styles.galleryHeader}>
                    <View>
                        <Text style={styles.cardLabel}>Organization Gallery</Text>
                        <Text style={styles.cardDescription}>
                            Share photos of your organization's activities, events, and impact
                        </Text>
                    </View>

                    {!isEditing && profileData.images.length > 0 && (
                        <TouchableOpacity
                            style={styles.deleteAllButton}
                            onPress={handleDeleteAllImages}
                        >
                            <Text style={styles.deleteAllButtonText}>🗑️ Delete All</Text>
                        </TouchableOpacity>
                    )}
                </View>

                {isEditing && (
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => handleImagePick('gallery')}
                    >
                        <Text style={styles.uploadButtonText}>📷 Add Images</Text>
                    </TouchableOpacity>
                )}

                {profileData.images.length > 0 ? (
                    <View style={styles.galleryGrid}>
                        {profileData.images.map((imageUri, index) => (
                            <View key={index} style={styles.galleryImageContainer}>
                                <Image source={{ uri: imageUri }} style={styles.galleryImage} />
                                {isEditing && (
                                    <TouchableOpacity
                                        style={styles.removeImageButton}
                                        onPress={() => handleRemoveImage(imageUri, index)}
                                    >
                                        <Text style={styles.removeImageText}>✕</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))}
                    </View>
                ) : (
                    <View style={styles.emptyGallery}>
                        <Text style={styles.emptyGalleryText}>No images yet</Text>
                        {!isEditing && (
                            <Text style={styles.emptyGallerySubtext}>
                                Click edit to add images
                            </Text>
                        )}
                    </View>
                )}
            </View>
        </View>
    );

    const renderAccountInfo = () => (
        <View style={styles.tabContent}>
            <View style={styles.infoCard}>
                <Text style={styles.cardLabel}>Registered Since</Text>
                <Text style={styles.cardValue}>
                    {ngoData?.createdAt ? new Date(ngoData.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    }) : 'Not available'}
                </Text>
            </View>

            {ngoData?.updatedAt && (
                <View style={styles.infoCard}>
                    <Text style={styles.cardLabel}>Last Updated</Text>
                    <Text style={styles.cardValue}>
                        {new Date(ngoData.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </Text>
                </View>
            )}

            {ngoData?._id && (
                <View style={styles.infoCard}>
                    <Text style={styles.cardLabel}>NGO ID</Text>
                    <Text style={styles.accountId}>{ngoData._id}</Text>
                </View>
            )}

            <View style={styles.logoutSection}>
                <TouchableOpacity
                    style={styles.logoutButton}
                    onPress={handleLogout}
                >
                    <Text style={styles.logoutButtonText}>🚪 Logout</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'basic':
                return renderBasicInfo();
            case 'organization':
                return renderOrganizationInfo();
            case 'gallery':
                return renderGallery();
            case 'account':
                return renderAccountInfo();
            default:
                return renderBasicInfo();
        }
    };

    if (isLoading && !ngoData) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLOR.light.primary} />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0D9488" />

            <View style={styles.header}>
                <View style={styles.headerContent}>
                    {profileData.logo ? (
                        <Image source={{ uri: profileData.logo }} style={styles.logo} />
                    ) : (
                        <View style={styles.logoPlaceholder}>
                            <Text style={styles.logoPlaceholderText}>
                                {profileData.organizationName?.charAt(0) || 'N'}
                            </Text>
                        </View>
                    )}
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.organizationName}>
                            {profileData.organizationName || 'Organization Name'}
                        </Text>
                        <Text style={styles.organizationCategory}>
                            {profileData.category || 'Category'}
                        </Text>
                    </View>
                </View>

                {(activeTab === 'organization' || activeTab === 'gallery') && (
                    <TouchableOpacity
                        style={[styles.editButton, isLoading && styles.editButtonDisabled]}
                        onPress={() => (isEditing ? handleSave() : setIsEditing(true))}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                            <Text style={styles.editButtonText}>
                                {isEditing ? '✓ Save' : '✏️ Edit'}
                            </Text>
                        )}
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.tabBar}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.tabBarScroll}
                >
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.id}
                            style={[
                                styles.tab,
                                activeTab === tab.id && styles.activeTab
                            ]}
                            onPress={() => {
                                setActiveTab(tab.id);
                                if (isEditing) {
                                    setIsEditing(false);
                                    setNewLogo(null);
                                    setNewImages([]);
                                    setImagesToDelete([]);
                                    setProfileData({
                                        organizationName: ngoData?.name || user?.organizationName || '',
                                        description: ngoData?.description || user?.description || '',
                                        category: ngoData?.category || user?.category || '',
                                        logo: ngoData?.logo || user?.logo || '',
                                        contact: ngoData?.contact || user?.contact || '',
                                        images: ngoData?.images || []
                                    });
                                }
                            }}
                        >
                            <Text style={styles.tabIcon}>{tab.icon}</Text>
                            <Text style={[
                                styles.tabText,
                                activeTab === tab.id && styles.activeTabText
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {renderContent()}

                {isEditing && (activeTab === 'organization' || activeTab === 'gallery') && (
                    <View style={styles.cancelButtonContainer}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => {
                                setIsEditing(false);
                                setNewLogo(null);
                                setNewImages([]);
                                setImagesToDelete([]);
                                setProfileData({
                                    organizationName: ngoData?.name || user?.organizationName || '',
                                    description: ngoData?.description || user?.description || '',
                                    category: ngoData?.category || user?.category || '',
                                    logo: ngoData?.logo || user?.logo || '',
                                    contact: ngoData?.contact || user?.contact || '',
                                    images: ngoData?.images || []
                                });
                            }}
                        >
                            <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                )}
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
        color: '#0D9488',
    },
    header: {
        backgroundColor: COLOR.light.darkblue,
        paddingTop: 48,
        paddingBottom: 24,
        paddingHorizontal: 24,
        position: 'relative',
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 16,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    logoPlaceholder: {
        width: 80,
        height: 80,
        borderRadius: 16,
        borderWidth: 4,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoPlaceholderText: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#FFFFFF',
    },
    headerTextContainer: {
        flex: 1,
        marginLeft: 16,
    },
    organizationName: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#FFFFFF',
        marginBottom: 4,
    },
    organizationCategory: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    editButton: {
        position: 'absolute',
        top: 48,
        right: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    editButtonDisabled: {
        opacity: 0.5,
    },
    editButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    tabBar: {
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    tabBarScroll: {
        paddingHorizontal: 8,
    },
    tab: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 16,
        marginHorizontal: 4,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: COLOR.light.orange,
    },
    tabIcon: {
        fontSize: 18,
        marginRight: 6,
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#6C757D',
    },
    activeTabText: {
        color: COLOR.light.orange,
        fontWeight: '700',
    },
    content: {
        flex: 1,
        padding: 16,
    },
    tabContent: {
        gap: 12,
    },
    infoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 1},
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    cardLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6C757D',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 8,
    },
    cardDescription: {
        fontSize: 13,
        color: '#6C757D',
        marginBottom: 12,
        lineHeight: 18,
    },
    cardValue: {
        fontSize: 16,
        color: '#212529',
    },
    cardValueMultiline: {
        fontSize: 16,
        color: '#212529',
        lineHeight: 24,
    },
    input: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 16,
        backgroundColor: '#F8F9FA',
        color: '#212529',
    },
    textArea: {
        height: 100,
        textAlignVertical: 'top',
    },
    typeBadge: {
        backgroundColor: '#0D9488',
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
        fontSize: 20,
        color: '#E9ECEF',
        marginRight: 2,
    },
    activeStar: {
        color: '#FFD700',
    },
    ratingText: {
        fontSize: 14,
        color: '#6C757D',
        fontWeight: '600',
    },
    categoryContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 8,
    },
    categoryOption: {
        borderWidth: 1,
        borderColor: '#DDD',
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginBottom: 8,
    },
    selectedCategoryOption: {
        backgroundColor: '#0D9488',
        borderColor: '#0D9488',
    },
    categoryOptionText: {
        fontSize: 13,
        color: '#666',
    },
    selectedCategoryOptionText: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    accountId: {
        fontSize: 16,
        color: '#212529',
        fontFamily: 'monospace',
    },
    logoutSection: {
        marginTop: 12,
    },
    logoutButton: {
        backgroundColor: '#E74C3C',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    uploadButton: {
        backgroundColor: '#0D9488',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 12,
    },
    uploadButtonText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    logoPreviewContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    logoPreview: {
        width: 120,
        height: 120,
        borderRadius: 12,
        marginBottom: 12,
    },
    changeLogoButton: {
        backgroundColor: '#6C757D',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    changeLogoText: {
        color: '#FFFFFF',
        fontSize: 13,
        fontWeight: '600',
    },
    galleryHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    deleteAllButton: {
        backgroundColor: '#E74C3C',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    deleteAllButtonText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '600',
    },
    galleryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginTop: 16,
    },
    galleryImageContainer: {
        width: '31%',
        aspectRatio: 1,
        position: 'relative',
    },
    galleryImage: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    removeImageButton: {
        position: 'absolute',
        top: 4,
        right: 4,
        backgroundColor: '#E74C3C',
        width: 24,
        height: 24,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    removeImageText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyGallery: {
        alignItems: 'center',
        paddingVertical: 32,
    },
    emptyGalleryText: {
        fontSize: 16,
        color: '#6C757D',
        fontWeight: '600',
    },
    emptyGallerySubtext: {
        fontSize: 13,
        color: '#999',
        marginTop: 4,
    },
    cancelButtonContainer: {
        marginTop: 16,
        marginBottom: 24,
    },
    cancelButton: {
        backgroundColor: '#6C757D',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    cancelButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});