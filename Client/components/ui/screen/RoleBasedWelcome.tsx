import React from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    StatusBar
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { COLOR } from '@/constants/ColorPallet';
import { Ionicons } from '@expo/vector-icons';

interface RoleBasedWelcomeProps {
    navigation: any;
}

export default function RoleBasedWelcome({ navigation }: RoleBasedWelcomeProps) {
    const { user } = useAuth();

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
                navigation.navigate('Process'); // Fallback to main app
        }
    };

    const navigateToMainApp = () => {
        navigation.navigate('Process');
    };

    const getRoleInfo = () => {
        if (!user) return null;
        
        switch (user.role) {
            case 'user':
                return {
                    title: 'Welcome to Legal Aid',
                    subtitle: 'Access legal resources and connect with professionals',
                    userType: 'Regular User',
                    color: COLOR.light.primary,
                    icon: 'person-outline',
                    actions: [
                        { title: 'Complete Profile', action: navigateToProfile, icon: 'person' },
                        { title: 'Browse Legal Resources', action: navigateToMainApp, icon: 'library-outline' },
                        { title: 'Find Lawyers', action: () => navigation.navigate('Process', { screen: 'Lawyer' }), icon: 'briefcase-outline' }
                    ]
                };
            case 'lawyer':
                return {
                    title: 'Welcome, Legal Professional',
                    subtitle: 'Manage your practice and connect with clients',
                    userType: 'Legal Professional',
                    color: '#8E44AD',
                    icon: 'briefcase-outline',
                    actions: [
                        { title: 'Complete Profile', action: navigateToProfile, icon: 'person' },
                        { title: 'View Legal Forum', action: () => navigation.navigate('Process', { screen: 'Forum' }), icon: 'chatbubbles-outline' },
                        { title: 'Browse Legal Resources', action: navigateToMainApp, icon: 'library-outline' }
                    ]
                };
            case 'ngo':
                return {
                    title: 'Welcome, NGO Representative',
                    subtitle: 'Manage your organization and reach those in need',
                    userType: 'NGO Representative',
                    color: '#16A085',
                    icon: 'heart-outline',
                    actions: [
                        { title: 'Complete Profile', action: navigateToProfile, icon: 'business' },
                        { title: 'View NGO Directory', action: () => navigation.navigate('Ngo'), icon: 'list-outline' },
                        { title: 'Browse Legal Resources', action: navigateToMainApp, icon: 'library-outline' }
                    ]
                };
            default:
                return null;
        }
    };

    const roleInfo = getRoleInfo();

    if (!user || !roleInfo) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Unable to load user information</Text>
                <TouchableOpacity style={styles.button} onPress={navigateToMainApp}>
                    <Text style={styles.buttonText}>Continue to App</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor={COLOR.light.light} />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={[styles.iconContainer, { backgroundColor: roleInfo.color }]}>
                    <Ionicons name={roleInfo.icon as any} size={40} color="#FFFFFF" />
                </View>
                <Text style={styles.title}>{roleInfo.title}</Text>
                <Text style={styles.subtitle}>{roleInfo.subtitle}</Text>
                <View style={[styles.userTypeBadge, { backgroundColor: roleInfo.color }]}>
                    <Text style={styles.userTypeText}>{roleInfo.userType}</Text>
                </View>
            </View>

            {/* User Info */}
            <View style={styles.userInfoCard}>
                <Text style={styles.welcomeText}>Welcome back,</Text>
                <Text style={styles.userName}>
                    {user.role === 'lawyer' && user.firstName && user.lastName 
                        ? `${user.firstName} ${user.lastName}`
                        : user.role === 'ngo' && user.organizationName
                        ? user.organizationName
                        : user.email
                    }
                </Text>
            </View>

            {/* Quick Actions */}
            <View style={styles.actionsContainer}>
                <Text style={styles.actionsTitle}>Quick Actions</Text>
                {roleInfo.actions.map((action, index) => (
                    <TouchableOpacity
                        key={index}
                        style={styles.actionButton}
                        onPress={action.action}
                    >
                        <View style={styles.actionIcon}>
                            <Ionicons name={action.icon as any} size={24} color={roleInfo.color} />
                        </View>
                        <Text style={styles.actionText}>{action.title}</Text>
                        <Ionicons name="chevron-forward" size={20} color="#999" />
                    </TouchableOpacity>
                ))}
            </View>

            {/* Skip Button */}
            <TouchableOpacity style={styles.skipButton} onPress={navigateToMainApp}>
                <Text style={styles.skipText}>Skip and Continue to App</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLOR.light.light,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
        marginBottom: 30,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: COLOR.light.primary,
        textAlign: 'center',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 16,
    },
    userTypeBadge: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    userTypeText: {
        color: '#FFFFFF',
        fontSize: 14,
        fontWeight: '600',
    },
    userInfoCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 20,
        marginBottom: 30,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    welcomeText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    userName: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLOR.light.primary,
    },
    actionsContainer: {
        flex: 1,
    },
    actionsTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: COLOR.light.primary,
        marginBottom: 16,
    },
    actionButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
    },
    actionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    actionText: {
        flex: 1,
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    skipButton: {
        backgroundColor: 'transparent',
        paddingVertical: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    skipText: {
        fontSize: 16,
        color: '#666',
        textDecorationLine: 'underline',
    },
    errorText: {
        fontSize: 16,
        color: '#E74C3C',
        textAlign: 'center',
        marginBottom: 20,
    },
    button: {
        backgroundColor: COLOR.light.primary,
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
    },
    buttonText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
});