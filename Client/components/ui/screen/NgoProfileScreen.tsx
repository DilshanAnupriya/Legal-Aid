import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    ScrollView,
    Text,
    Image,
    TouchableOpacity,
    StatusBar,
    Alert,
    Linking,
    Share,
    Dimensions
} from 'react-native';

const { width } = Dimensions.get('window');

// @ts-ignore
export default function NgoProfileScreen({route, navigation }) {
    const { ngoId } = route.params;
    const [ngo, setNgo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // API configuration
    const getApiUrl = () => {
        const DEV_IP = 'localhost'; //192.168.8.189
        return `http://${DEV_IP}:3000/api/ngo`;
    };

    const API_BASE_URL = getApiUrl();

    useEffect(() => {
        fetchNgoDetails();
    }, [ngoId]);

    const fetchNgoDetails = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_BASE_URL}/ngo/${ngoId}`);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.message === 'success' && data.data) {
                setNgo(data.data);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to fetch NGO details. Please try again.');
            console.error('Fetch NGO details error:', error);
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phoneNumber) => {
        if (phoneNumber) {
            Linking.openURL(`tel:${phoneNumber}`);
        }
    };

    const handleEmail = (email) => {
        if (email) {
            Linking.openURL(`mailto:${email}`);
        }
    };

    const handleWebsite = (website) => {
        if (website) {
            const url = website.startsWith('http') ? website : `https://${website}`;
            Linking.openURL(url);
        }
    };

    const handleShare = async () => {
        try {
            const message = `Check out ${ngo.name}!\n\n${ngo.description}\n\nCategory: ${ngo.category}\nRating: ${ngo.rating}/5`;
            await Share.share({
                message,
                title: ngo.name,
            });
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };

    const renderImageCarousel = () => {
        if (!ngo.images || ngo.images.length === 0) {
            return (
                <View style={styles.noImageContainer}>
                    <Text style={styles.noImageText}>No images available</Text>
                </View>
            );
        }

        return (
            <View style={styles.imageCarouselContainer}>
                <ScrollView
                    horizontal
                    pagingEnabled
                    showsHorizontalScrollIndicator={false}
                    scrollEventThrottle={16}
                    decelerationRate="fast"
                    snapToInterval={width}
                    snapToAlignment="start"
                    onMomentumScrollEnd={(event) => {
                        const index = Math.round(event.nativeEvent.contentOffset.x / width);
                        setActiveImageIndex(index);
                    }}
                    nestedScrollEnabled={true}
                >
                    {ngo.images.map((image, index) => (
                        <Image
                            key={index}
                            source={{ uri: image }}
                            style={styles.carouselImage}
                            resizeMode="cover"
                        />
                    ))}
                </ScrollView>

                {ngo.images.length > 1 && (
                    <View style={styles.imageIndicators}>
                        {ngo.images.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.indicator,
                                    activeImageIndex === index && styles.activeIndicator
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>
        );
    };

    const renderRating = () => {
        const rating = ngo.rating || 0;
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

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading NGO details...</Text>
            </View>
        );
    }

    if (!ngo) {
        return (
            <View style={styles.errorContainer}>
                <Text style={styles.errorText}>NGO not found</Text>
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Text style={styles.backButtonText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2C5AA0" />



            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.scrollContent}
                keyboardShouldPersistTaps="handled"
            >
                {/* Image Carousel */}
                {renderImageCarousel()}

                {/* Basic Info */}
                <View style={styles.basicInfoContainer}>
                    <View style={styles.logoAndTitleContainer}>
                        {ngo.logo && (
                            <Image source={{ uri: ngo.logo }} style={styles.logo} />
                        )}
                        <View style={styles.titleContainer}>
                            <Text style={styles.ngoName}>{ngo.name}</Text>
                            <Text style={styles.category}>{ngo.category}</Text>
                            {renderRating()}
                        </View>
                    </View>
                </View>

                {/* Description */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>About</Text>
                    <Text style={styles.description}>{ngo.description}</Text>
                </View>

                {/* Contact Information */}
                <View style={styles.sectionContainer}>
                    <Text style={styles.sectionTitle}>Contact Information</Text>

                    {ngo.email && (
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => handleEmail(ngo.email)}
                        >
                            <Text style={styles.contactLabel}>Email:</Text>
                            <Text style={styles.contactValue}>{ngo.email}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Using 'contact' field from schema instead of 'phone' */}
                    {ngo.contact && (
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => handleCall(ngo.contact)}
                        >
                            <Text style={styles.contactLabel}>Phone:</Text>
                            <Text style={styles.contactValue}>{ngo.contact}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Website field doesn't exist in schema - conditionally render if exists */}
                    {ngo.website && (
                        <TouchableOpacity
                            style={styles.contactItem}
                            onPress={() => handleWebsite(ngo.website)}
                        >
                            <Text style={styles.contactLabel}>Website:</Text>
                            <Text style={styles.contactValue}>{ngo.website}</Text>
                        </TouchableOpacity>
                    )}

                    {/* Address field doesn't exist in schema - conditionally render if exists */}
                    {ngo.address && (
                        <View style={styles.contactItem}>
                            <Text style={styles.contactLabel}>Address:</Text>
                            <Text style={styles.contactValue}>{ngo.address}</Text>
                        </View>
                    )}
                </View>

                {/* Mission & Vision - these fields don't exist in schema */}
                {(ngo.mission || ngo.vision) && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Mission & Vision</Text>

                        {ngo.mission && (
                            <View style={styles.missionVisionItem}>
                                <Text style={styles.missionVisionLabel}>Mission:</Text>
                                <Text style={styles.missionVisionText}>{ngo.mission}</Text>
                            </View>
                        )}

                        {ngo.vision && (
                            <View style={styles.missionVisionItem}>
                                <Text style={styles.missionVisionLabel}>Vision:</Text>
                                <Text style={styles.missionVisionText}>{ngo.vision}</Text>
                            </View>
                        )}
                    </View>
                )}

                {/* Additional Details - some fields don't exist in schema */}
                {(ngo.foundedYear || ngo.employeesCount || ngo.status) && (
                    <View style={styles.sectionContainer}>
                        <Text style={styles.sectionTitle}>Additional Information</Text>

                        {ngo.foundedYear && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Founded:</Text>
                                <Text style={styles.detailValue}>{ngo.foundedYear}</Text>
                            </View>
                        )}

                        {ngo.employeesCount && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Employees:</Text>
                                <Text style={styles.detailValue}>{ngo.employeesCount}</Text>
                            </View>
                        )}

                        {ngo.status && (
                            <View style={styles.detailItem}>
                                <Text style={styles.detailLabel}>Status:</Text>
                                <View style={[styles.statusBadge, ngo.status === 'active' && styles.activeStatus]}>
                                    <Text style={styles.statusText}>{ngo.status.toUpperCase()}</Text>
                                </View>
                            </View>
                        )}
                    </View>
                )}

                {/* Action Buttons */}
                <View style={styles.actionButtonsContainer}>
                    {/* Using 'contact' field instead of 'phone' */}
                    {ngo.contact && (
                        <TouchableOpacity
                            style={styles.actionButton}
                            onPress={() => handleCall(ngo.contact)}
                        >
                            <Text style={styles.actionButtonText}>Call Now</Text>
                        </TouchableOpacity>
                    )}

                    {ngo.email && (
                        <TouchableOpacity
                            style={[styles.actionButton, styles.secondaryButton]}
                            onPress={() => handleEmail(ngo.email)}
                        >
                            <Text style={[styles.actionButtonText, styles.secondaryButtonText]}>Send Email</Text>
                        </TouchableOpacity>
                    )}
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
        fontSize: 16,
        color: '#666',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    errorText: {
        fontSize: 18,
        color: '#E74C3C',
        marginBottom: 20,
    },
    backButton: {
        backgroundColor: '#2C5AA0',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 8,
    },
    backButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#2C5AA0',
        paddingHorizontal: 16,
        paddingTop: 50,
        paddingBottom: 16,
    },
    backIconButton: {
        padding: 8,
    },
    backIcon: {
        color: '#FFFFFF',
        fontSize: 24,
        fontWeight: 'bold',
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: 20,
        fontWeight: 'bold',
    },
    shareButton: {
        padding: 8,
    },
    shareIcon: {
        color: '#FFFFFF',
        fontSize: 20,
    },
    content: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        paddingBottom: 50,
    },
    imageCarouselContainer: {
        height: 250,
        position: 'relative',
        marginBottom: 0,
    },
    carouselImage: {
        width: width,
        height: 250,
    },
    noImageContainer: {
        height: 250,
        backgroundColor: '#E9ECEF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    noImageText: {
        color: '#6C757D',
        fontSize: 16,
    },
    imageIndicators: {
        position: 'absolute',
        bottom: 16,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 4,
    },
    activeIndicator: {
        backgroundColor: '#FFFFFF',
        width: 12,
        height: 12,
        borderRadius: 6,
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
    logoAndTitleContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    logo: {
        width: 80,
        height: 80,
        borderRadius: 12,
        marginRight: 16,
    },
    titleContainer: {
        flex: 1,
    },
    ngoName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1A1A1A',
        marginBottom: 4,
    },
    category: {
        fontSize: 16,
        color: '#2C5AA0',
        marginBottom: 8,
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
    },
    activeStar: {
        color: '#FFD700',
    },
    ratingText: {
        fontSize: 14,
        color: '#666',
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
    description: {
        fontSize: 16,
        color: '#444',
        lineHeight: 24,
    },
    contactItem: {
        flexDirection: 'row',
        paddingVertical: 8,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F1F1',
    },
    contactLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        width: 80,
    },
    contactValue: {
        fontSize: 16,
        color: '#2C5AA0',
        flex: 1,
        textDecorationLine: 'underline',
    },
    missionVisionItem: {
        marginBottom: 16,
    },
    missionVisionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    missionVisionText: {
        fontSize: 16,
        color: '#444',
        lineHeight: 22,
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
        width: 100,
    },
    detailValue: {
        fontSize: 16,
        color: '#444',
        flex: 1,
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
    actionButtonsContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingVertical: 20,
        gap: 12,
    },
    actionButton: {
        flex: 1,
        backgroundColor:'#1C2F42',
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#d35400',
    },
    actionButtonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButtonText: {
        color: '#d35400',
    },
});