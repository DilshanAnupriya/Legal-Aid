import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from '@/components/ui/screen/LoginScreen';
import SignUpScreen from '@/components/ui/screen/SignUpScreen';
import AdminDashboard from '@/components/ui/screen/AdminDashboard';
import StackNavigator from './StackNavigator';

const Stack = createStackNavigator();

export default function AuthNavigator() {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Monitor authentication state changes
    useEffect(() => {
        console.log('[AuthNavigator] Auth state changed:', {
            isAuthenticated,
            isLoading,
            hasUser: !!user,
            userRole: user?.role
        });
    }, [isAuthenticated, isLoading, user]);

    // Add some debugging
    console.log('[AuthNavigator] Render - isAuthenticated:', isAuthenticated, 'isLoading:', isLoading, 'hasUser:', !!user);

    // Show loading indicator while checking authentication
    if (isLoading) {
        console.log('[AuthNavigator] Showing loading screen');
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    // If user is authenticated, show main app navigation
    if (isAuthenticated) {
        console.log('[AuthNavigator] User is authenticated, showing main app');
        return <StackNavigator />;
    }

    // If user is not authenticated, show auth screens
    console.log('[AuthNavigator] User not authenticated, showing login screens');
    return (
        <Stack.Navigator
            initialRouteName="Login"
            screenOptions={{
                headerStyle: {
                    backgroundColor: '#667eea',
                },
                headerTitleStyle: {
                    color: '#FFFFFF',
                    fontSize: 18,
                    fontWeight: 'bold',
                },
                headerTintColor: '#FFFFFF',
            }}
        >
            <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{
                    title: 'Sign In',
                    headerLeft: () => null, // Disable back button
                }}
            />
            <Stack.Screen
                name="SignUp"
                component={SignUpScreen}
                options={{
                    title: 'Create Account',
                }}
            />
            <Stack.Screen
                name="AdminDashboard"
                component={AdminDashboard}
                options={{
                    title: 'Admin Dashboard',
                    headerLeft: () => null, // Disable back button
                }}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f8f9fa',
    },
});