import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeBottomTabNavigation from "@/app/navigation/tab-navigation/HomeBottomTabNavigation";
import { COLOR } from "@/constants/ColorPallet";
import NgoScreen from "@/components/ui/screen/menu/NgoScreen";
import UserProfile from "@/components/ui/screen/UserProfile";
import LawyerRegistrationForm from "@/components/ui/screen/LawyerRegistration";
import LawyersTableAdmin from "@/components/modals/lawyersTableAdmin";
import LawyerProfile from "@/components/ui/screen/LawyerDetails"
import LoginScreen from "@/components/ui/screen/LoginScreen";
import SignUpScreen from "@/components/ui/screen/SignUpScreen";
import React from "react";
import NgoProfileScreen from "@/components/ui/screen/NgoProfileScreen";

const Stack = createStackNavigator();

export default function StackNavigator() {
    return (
        <Stack.Navigator

            screenOptions={{
                headerStyle: styles.header, // Header background
                headerTitleStyle: styles.headerTitle, // Header text
                cardStyle: styles.card, // Screen background
            }}
        >
            <Stack.Screen
                name={'Process'}
                component={HomeBottomTabNavigation}
                options={{headerLeft: () => null, headerShown: false,}}
            />
            <Stack.Screen
                name={'Ngo'}
                options={{title:'NGO'}}
                component={NgoScreen}
            />

            <Stack.Screen
                name={'Profile'}
                options={{title:'Profile'}}
                component={UserProfile}
            />

            <Stack.Screen
                name={'LawyerRegistrationForm'}
                options={{title:'LawyerRegistrationForm'}}
                component={LawyerRegistrationForm}
            />

            <Stack.Screen
                name={'LawyersTableAdmin'}
                options={{title:'Lawyers Table'}}
                component={LawyersTableAdmin}
            />

            <Stack.Screen
                name={'LawyerProfile'}
                options={{title:'Lawyers profile'}}
                component={LawyerProfile}
            />
            <Stack.Screen
                name="NgoProfile"
                component={NgoProfileScreen}
                options={({ route }) => ({
                    title: 'NGO Profile',
                    // You can add more options here if needed
                })}
            />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLOR.light.light, // example primary color
        shadowColor: "transparent", // removes shadow on iOS
        elevation: 0, // removes shadow on Android
    },
    headerTitle: {
        color: COLOR.light.primary,
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        backgroundColor: COLOR.light.light, // Changed from COLOR.light to COLOR.light.background
    },
});