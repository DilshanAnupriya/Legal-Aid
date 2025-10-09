import React, { useState, useRef, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    FlatList,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
    StyleSheet,
    SafeAreaView,
    StatusBar,
    Animated,
    Image,
    Linking,
    Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLOR } from '@/constants/ColorPallet';
import { LinearGradient } from 'expo-linear-gradient';

const API_URL = 'http://localhost:3000'; // Update with your server IP

const ChatScreen = () => {
    const [messages, setMessages] = useState([
        {
            id: '1',
            text: 'Hello! I\'m your Legal Aid Assistant. I can provide general legal information and guidance. How can I help you today?',
            sender: 'bot',
            timestamp: new Date().toISOString(),
        },
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [ngoRecommendations, setNgoRecommendations] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [messageCount, setMessageCount] = useState(0);
    const flatListRef = useRef(null);
    const typingAnimation = useRef(new Animated.Value(0)).current;

    // Typing animation
    useEffect(() => {
        if (isTyping) {
            Animated.loop(
                Animated.sequence([
                    Animated.timing(typingAnimation, {
                        toValue: 1,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                    Animated.timing(typingAnimation, {
                        toValue: 0,
                        duration: 600,
                        useNativeDriver: true,
                    }),
                ])
            ).start();
        } else {
            typingAnimation.setValue(0);
        }
    }, [isTyping]);

    // Auto-scroll
    useEffect(() => {
        if (flatListRef.current && messages.length > 0) {
            setTimeout(() => {
                flatListRef.current?.scrollToEnd({ animated: true });
            }, 100);
        }
    }, [messages]);

    // Fetch NGO recommendations after every 3 messages
    useEffect(() => {
        if (messageCount >= 4 && messageCount % 3 === 0) {
            fetchNGORecommendations();
        }
    }, [messageCount]);

    const fetchNGORecommendations = async () => {
        try {
            const conversationHistory = messages
                .filter((msg) => msg.sender !== 'system')
                .map((msg) => ({
                    sender: msg.sender,
                    text: msg.text,
                }));

            const response = await fetch(`${API_URL}/api/ngo/match`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    conversationHistory,
                    lastMessage: messages[messages.length - 1]?.text
                }),
            });

            const data = await response.json();

            if (response.ok && data.recommendations?.length > 0) {
                setNgoRecommendations(data);
                setShowRecommendations(true);

                // Add a system message about recommendations
                const recommendationMessage = {
                    id: Date.now().toString(),
                    text: `I found ${data.recommendations.length} organizations that can help you with ${data.analysis.detectedCategories.join(', ')}. Check the recommendations below! 👇`,
                    sender: 'bot',
                    timestamp: new Date().toISOString(),
                };
                setMessages((prev) => [...prev, recommendationMessage]);
            }
        } catch (error) {
            console.error('NGO matching error:', error);
        }
    };

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: 'user',
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);
        setIsTyping(true);
        setMessageCount(prev => prev + 1);

        try {
            const conversationHistory = messages
                .filter((msg) => msg.sender !== 'system')
                .map((msg) => ({
                    sender: msg.sender,
                    text: msg.text,
                }));

            const response = await fetch(`${API_URL}/api/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    conversationHistory: conversationHistory,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                const botMessage = {
                    id: (Date.now() + 1).toString(),
                    text: data.message,
                    sender: 'bot',
                    timestamp: data.timestamp,
                };
                setMessages((prev) => [...prev, botMessage]);
                setMessageCount(prev => prev + 1);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again.',
                sender: 'system',
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setIsTyping(false);
        }
    };

    const handleContactNGO = (ngo) => {
        Alert.alert(
            'Contact NGO',
            `Would you like to contact ${ngo.name}?`,
            [
                {
                    text: 'Call',
                    onPress: () => Linking.openURL(`tel:${ngo.contact}`)
                },
                {
                    text: 'Email',
                    onPress: () => Linking.openURL(`mailto:${ngo.email}`)
                },
                {
                    text: 'Cancel',
                    style: 'cancel'
                }
            ]
        );
    };

    const NGORecommendationCard = ({ ngo }) => (
        <View style={styles.ngoCard}>
            <View style={styles.ngoCardContent}>
                {ngo.logo && (
                    <Image
                        source={{ uri: ngo.logo }}
                        style={styles.ngoLogo}
                    />
                )}
                <View style={styles.ngoInfo}>
                    <View style={styles.ngoHeader}>
                        <Text style={styles.ngoName} numberOfLines={2}>{ngo.name}</Text>
                        <View style={styles.ratingBadge}>
                            <Ionicons name="star" size={12} color="#F59E0B" />
                            <Text style={styles.ratingText}>{ngo.rating.toFixed(1)}</Text>
                        </View>
                    </View>

                    <Text style={styles.ngoDescription} numberOfLines={3}>
                        {ngo.description}
                    </Text>

                    <View style={styles.ngoBadges}>
                        <View style={styles.categoryBadge}>
                            <Text style={styles.categoryBadgeText} numberOfLines={1}>
                                {ngo.category}
                            </Text>
                        </View>
                        {ngo.matchReason && (
                            <View style={styles.matchBadge}>
                                <Ionicons name="checkmark-circle" size={10} color="#059669" />
                                <Text style={styles.matchBadgeText} numberOfLines={1}>
                                    {ngo.matchReason.split(' • ')[0]}
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.ngoActions}>
                        <TouchableOpacity
                            style={styles.contactButton}
                            onPress={() => handleContactNGO(ngo)}
                        >
                            <LinearGradient
                                colors={[COLOR.light.primary, COLOR.light.secondary]}
                                style={styles.contactButtonGradient}
                            >
                                <Ionicons name="call" size={16} color="#fff" />
                                <Text style={styles.contactButtonText}>Contact</Text>
                            </LinearGradient>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.detailsButton}
                            onPress={() => Alert.alert('View Details', `More info about ${ngo.name}`)}
                        >
                            <Text style={styles.detailsButtonText}>Details</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );

    const NGORecommendationsSection = () => (
        <View style={styles.recommendationsSection}>
            <View style={styles.recommendationHeader}>
                <View style={styles.recommendationHeaderContent}>
                    <Ionicons name="bulb" size={24} color={COLOR.light.primary} />
                    <View style={styles.recommendationHeaderText}>
                        <Text style={styles.recommendationTitle}>
                            Recommended NGOs for You
                        </Text>
                        <Text style={styles.recommendationSubtitle}>
                            {ngoRecommendations.recommendations.length} organizations can help
                        </Text>
                    </View>
                </View>

                {ngoRecommendations.analysis && (
                    <View style={styles.detectedCategories}>
                        {ngoRecommendations.analysis.detectedCategories.slice(0, 2).map((cat, idx) => (
                            <View key={idx} style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>{cat}</Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {ngoRecommendations.recommendations.map((ngo) => (
                <NGORecommendationCard key={ngo._id} ngo={ngo} />
            ))}

            <TouchableOpacity
                style={styles.hideButton}
                onPress={() => setShowRecommendations(false)}
            >
                <Text style={styles.hideButtonText}>Hide Recommendations</Text>
            </TouchableOpacity>
        </View>
    );

    const TypingIndicator = () => (
        <View style={styles.typingContainer}>
            <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                    {[0, 1, 2].map((i) => (
                        <Animated.View
                            key={i}
                            style={[
                                styles.typingDot,
                                {
                                    opacity: typingAnimation.interpolate({
                                        inputRange: [0, 1],
                                        outputRange: i === 0 ? [0.3, 1] : i === 1 ? [0.3, 0.7] : [0.3, 0.4],
                                    }),
                                },
                            ]}
                        />
                    ))}
                </View>
            </View>
        </View>
    );

    const renderMessage = ({ item, index }) => {
        const isUser = item.sender === 'user';
        const isSystem = item.sender === 'system';
        const showAvatar = !isUser && (index === 0 || messages[index - 1]?.sender !== 'bot');

        return (
            <View
                style={[
                    styles.messageContainer,
                    isUser ? styles.userMessageContainer : styles.botMessageContainer,
                ]}
            >
                {!isUser && showAvatar && (
                    <View style={styles.avatarContainer}>
                        <LinearGradient
                            colors={[COLOR.light.primary, COLOR.light.secondary]}
                            style={styles.avatar}
                        >
                            <Ionicons name="chatbubble-ellipses" size={16} color="#fff" />
                        </LinearGradient>
                    </View>
                )}

                {!isUser && !showAvatar && <View style={styles.avatarPlaceholder} />}

                <View
                    style={[
                        styles.messageBubble,
                        isUser
                            ? styles.userBubble
                            : isSystem
                                ? styles.systemBubble
                                : styles.botBubble,
                    ]}
                >
                    <Text
                        style={[
                            styles.messageText,
                            isUser ? styles.userMessageText : styles.botMessageText,
                        ]}
                    >
                        {item.text}
                    </Text>
                    <Text
                        style={[
                            styles.timestamp,
                            isUser ? styles.userTimestamp : styles.botTimestamp,
                        ]}
                    >
                        {new Date(item.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor={COLOR.light.primary} />

            {/* Header */}
            <LinearGradient
                colors={[COLOR.light.primary, COLOR.light.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.header}
            >
                <View style={styles.headerContent}>
                    <View style={styles.headerIconContainer}>
                        <Ionicons name="shield-checkmark" size={28} color="#fff" />
                    </View>
                    <View style={styles.headerTextContainer}>
                        <Text style={styles.headerTitle}>Legal Aid Assistant</Text>
                        <View style={styles.statusContainer}>
                            <View style={styles.onlineIndicator} />
                            <Text style={styles.headerSubtitle}>Online • Powered by Gemini AI</Text>
                        </View>
                    </View>
                </View>
            </LinearGradient>

            {/* Messages List */}
            <View style={styles.messagesContainer}>
                <FlatList
                    ref={flatListRef}
                    data={messages}
                    renderItem={renderMessage}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.messagesList}
                    showsVerticalScrollIndicator={false}
                    onContentSizeChange={() =>
                        flatListRef.current?.scrollToEnd({ animated: true })
                    }
                    ListFooterComponent={() => (
                        <>
                            {isTyping && <TypingIndicator />}
                            {showRecommendations && ngoRecommendations && (
                                <NGORecommendationsSection />
                            )}
                        </>
                    )}
                />
            </View>

            {/* Input Area */}
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
            >
                <View style={styles.inputWrapper}>
                    <View style={styles.inputContainer}>
                        <View style={styles.inputContent}>
                            <TextInput
                                style={styles.input}
                                value={inputText}
                                onChangeText={setInputText}
                                placeholder="Ask a legal question..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                maxLength={500}
                                editable={!isLoading}
                            />
                            {inputText.length > 0 && (
                                <Text style={styles.charCount}>{inputText.length}/500</Text>
                            )}
                        </View>
                        <TouchableOpacity
                            style={[
                                styles.sendButton,
                                (!inputText.trim() || isLoading) && styles.sendButtonDisabled,
                            ]}
                            onPress={sendMessage}
                            disabled={!inputText.trim() || isLoading}
                            activeOpacity={0.8}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <LinearGradient
                                    colors={
                                        !inputText.trim()
                                            ? ['#E5E7EB', '#E5E7EB']
                                            : [COLOR.light.primary, COLOR.light.secondary]
                                    }
                                    start={{ x: 0, y: 0 }}
                                    end={{ x: 1, y: 1 }}
                                    style={styles.sendButtonGradient}
                                >
                                    <Ionicons
                                        name="send"
                                        size={20}
                                        color={!inputText.trim() ? '#9CA3AF' : '#fff'}
                                    />
                                </LinearGradient>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    header: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
    },
    headerContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    headerIconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTextContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#fff',
        letterSpacing: 0.3,
    },
    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    onlineIndicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#10B981',
    },
    headerSubtitle: {
        fontSize: 13,
        color: 'rgba(255, 255, 255, 0.9)',
        fontWeight: '500',
    },
    messagesContainer: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    messagesList: {
        padding: 16,
        paddingBottom: 8,
    },
    messageContainer: {
        marginBottom: 16,
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 8,
    },
    userMessageContainer: {
        justifyContent: 'flex-end',
        marginLeft: 60,
    },
    botMessageContainer: {
        justifyContent: 'flex-start',
        marginRight: 60,
    },
    avatarContainer: {
        marginBottom: 4,
    },
    avatar: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    avatarPlaceholder: {
        width: 36,
    },
    messageBubble: {
        flex: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
    },
    userBubble: {
        backgroundColor: COLOR.light.primary,
        borderBottomRightRadius: 4,
    },
    botBubble: {
        backgroundColor: '#FFFFFF',
        borderBottomLeftRadius: 4,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    systemBubble: {
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FCD34D',
    },
    messageText: {
        fontSize: 15,
        lineHeight: 22,
        letterSpacing: 0.2,
    },
    userMessageText: {
        color: '#FFFFFF',
    },
    botMessageText: {
        color: '#1F2937',
    },
    timestamp: {
        fontSize: 11,
        marginTop: 6,
        fontWeight: '500',
    },
    userTimestamp: {
        color: 'rgba(255, 255, 255, 0.8)',
        textAlign: 'right',
    },
    botTimestamp: {
        color: '#9CA3AF',
    },
    typingContainer: {
        flexDirection: 'row',
        paddingHorizontal: 16,
        paddingBottom: 12,
        alignItems: 'flex-end',
        gap: 8,
    },
    typingBubble: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        borderBottomLeftRadius: 4,
        marginLeft: 44,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    typingDots: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    typingDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: COLOR.light.primary,
    },
    // NGO Recommendation Styles
    recommendationsSection: {
        marginTop: 16,
        marginBottom: 8,
    },
    recommendationHeader: {
        backgroundColor: '#EEF2FF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#C7D2FE',
    },
    recommendationHeaderContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8,
    },
    recommendationHeaderText: {
        flex: 1,
    },
    recommendationTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginBottom: 2,
    },
    recommendationSubtitle: {
        fontSize: 13,
        color: '#6B7280',
    },
    detectedCategories: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 8,
    },
    categoryTag: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#C7D2FE',
    },
    categoryTagText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLOR.light.primary,
    },
    ngoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#E0E7FF',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    ngoCardContent: {
        flexDirection: 'row',
        gap: 12,
    },
    ngoLogo: {
        width: 64,
        height: 64,
        borderRadius: 12,
        backgroundColor: '#F3F4F6',
    },
    ngoInfo: {
        flex: 1,
    },
    ngoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    ngoName: {
        flex: 1,
        fontSize: 16,
        fontWeight: '700',
        color: '#1F2937',
        marginRight: 8,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F59E0B',
    },
    ngoDescription: {
        fontSize: 13,
        color: '#6B7280',
        lineHeight: 18,
        marginBottom: 10,
    },
    ngoBadges: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginBottom: 12,
    },
    categoryBadge: {
        backgroundColor: '#EEF2FF',
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        maxWidth: '60%',
    },
    categoryBadgeText: {
        fontSize: 11,
        fontWeight: '600',
        color: COLOR.light.primary,
    },
    matchBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 3,
        backgroundColor: '#D1FAE5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
        maxWidth: '40%',
    },
    matchBadgeText: {
        fontSize: 10,
        fontWeight: '600',
        color: '#059669',
    },
    ngoActions: {
        flexDirection: 'row',
        gap: 8,
    },
    contactButton: {
        flex: 1,
        borderRadius: 10,
        overflow: 'hidden',
        elevation: 2,
    },
    contactButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        paddingVertical: 10,
        paddingHorizontal: 16,
    },
    contactButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: '#FFFFFF',
    },
    detailsButton: {
        flex: 1,
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: COLOR.light.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    detailsButtonText: {
        fontSize: 13,
        fontWeight: '700',
        color: COLOR.light.primary,
    },
    hideButton: {
        alignItems: 'center',
        paddingVertical: 12,
    },
    hideButtonText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#6B7280',
    },
    inputWrapper: {
        backgroundColor: '#FFFFFF',
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: 12,
        paddingBottom: Platform.OS === 'ios' ? 8 : 12,
        paddingHorizontal: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        gap: 10,
    },
    inputContent: {
        flex: 1,
        backgroundColor: '#F3F4F6',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
    },
    input: {
        paddingHorizontal: 18,
        paddingTop: 12,
        paddingBottom: 12,
        fontSize: 15,
        maxHeight: 100,
        color: '#1F2937',
        lineHeight: 20,
    },
    charCount: {
        fontSize: 11,
        color: '#9CA3AF',
        paddingHorizontal: 18,
        paddingBottom: 8,
        textAlign: 'right',
    },
    sendButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 4,
        shadowColor: COLOR.light.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
    },
    sendButtonDisabled: {
        elevation: 0,
        shadowOpacity: 0,
    },
    sendButtonGradient: {
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default ChatScreen;