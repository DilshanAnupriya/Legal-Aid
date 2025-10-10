import React, { useEffect } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { useAuth } from '@/context/AuthContext';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import LoginScreen from '@/components/ui/screen/LoginScreen';
import SignUpScreen from '@/components/ui/screen/SignUpScreen';
import AdminDashboard from '@/components/ui/screen/AdminDashboard';
import AdminNGOsScreen from '@/components/ui/screen/AdminNGOsScreen';
import StackNavigator from './StackNavigator';
import AdminManageLawyers from '@/components/ui/screen/AdminLawyersScreen';

const Stack = createStackNavigator();

export default function AuthNavigator() {
    const { isAuthenticated, isLoading, user } = useAuth();

    // Monitor authentication state changes
    useEffect(() => {
       
    }, [isAuthenticated, isLoading, user]);

   
    // Show loading indicator while checking authentication
    if (isLoading) {
       
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#667eea" />
            </View>
        );
    }

    // If user is authenticated, show main app navigation
    if (isAuthenticated) {
        return <StackNavigator />;
    }

    // If user is not authenticated, show auth screens
    
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
            <Stack.Screen
                name="AdminNGOs"
                component={AdminNGOsScreen}
                options={{
                    title: 'Manage NGOs',
                    headerShown: false, // We have custom header in the component
                }}
            />

            <Stack.Screen
                name="AdminManageLawyers"
                component={AdminManageLawyers}
                options={{
                    title: 'Lawyers Manage Screen',
                    headerShown: false,
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