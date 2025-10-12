import React from "react";
import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeBottomTabNavigation from "@/app/navigation/tab-navigation/HomeBottomTabNavigation";
import { COLOR } from "@/constants/ColorPallet";
import NgoScreen from "@/components/ui/screen/menu/NgoScreen";
import NgoProfileScreen from "@/components/ui/screen/NgoProfileScreen";
import UserProfileScreen from "@/components/ui/screen/UserProfileScreen";
import LawyerProfileScreen from "@/components/ui/screen/LawyerProfileScreen";
import NgoOwnProfileScreen from "@/components/ui/screen/NgoOwnProfileScreen";
import RoleBasedWelcome from "@/components/ui/screen/RoleBasedWelcome";
import UserProfile from "@/components/ui/screen/UserProfile";
import LawyerRegistrationForm from "@/components/ui/screen/LawyerRegistration";
import LawyersTableAdmin from "@/components/modals/lawyersTableAdmin";
import LawyerProfile from "@/components/ui/screen/LawyerDetails";
import LanguageSettingsScreen from "@/components/ui/screen/LanguageSettingsScreen";

import Doc from "@/components/ui/screen/DocumentGeneratorScreen";
import LawyerAppointmentsScreen from "@/components/ui/screen/widget/LawyerDashboard/LawyerAppointmentsScreen";

import ChatScreen from "@/components/ui/screen/ChatScreen";
const Stack = createStackNavigator();

export default function StackNavigator() {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: styles.header,
                headerTitleStyle: styles.headerTitle,
                cardStyle: styles.card,
            }}
        >
            <Stack.Screen
                name={'Process'}
                component={HomeBottomTabNavigation}
                options={{headerLeft: () => null, headerShown: false}}
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
                options={{title:'Lawyer Registration'}}
                component={LawyerRegistrationForm}
            />
            <Stack.Screen
                name={'LawyersTableAdmin'}
                options={{title:'Lawyers Table'}}
                component={LawyersTableAdmin}
            />
            <Stack.Screen
                name={'LawyerProfile'}
                options={{title:'Lawyer Profile'}}
                component={LawyerProfile}
            />
            <Stack.Screen
                name="NgoProfile"
                component={NgoProfileScreen}
                options={{
                    title: 'NGO Profile',
                }}
            />
            <Stack.Screen
                name="UserProfile"
                component={UserProfileScreen}
                options={{
                    title: 'My Profile'
                }}
            />
            <Stack.Screen
                name="LawyerOwnProfile"
                component={LawyerProfileScreen}
                options={{
                    title: 'My Profile'
                }}
            />
            <Stack.Screen
                name="NgoOwnProfile"
                component={NgoOwnProfileScreen}
                options={{
                    title: 'My Profile'
                }}
            />
            <Stack.Screen
                name="RoleBasedWelcome"
                component={RoleBasedWelcome}
                options={{
                    title: 'Welcome',
                    headerLeft: () => null,
                }}
            />
            <Stack.Screen
                name="LanguageSettings"
                component={LanguageSettingsScreen}
                options={{
                    headerShown: false,
                }}
            />
            <Stack.Screen
            name="LawyerAppointmentsScreen"
            component={LawyerAppointmentsScreen}
            options={{
                headerShown: false, // Using custom header in ChatScreen
            }}
            />
            <Stack.Screen
                name="Chat"
                component={ChatScreen}
                options={{
                    headerShown: false, // Using custom header in ChatScreen
                }}
            />

            <Stack.Screen
            name="DocumentGenerator"
            component={Doc}
            options={{
                headerShown: false, // Using custom header in ChatScreen
            }}
        />
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    header: {
        backgroundColor: COLOR.light.light,
        shadowColor: "transparent",
        elevation: 0,
    },
    headerTitle: {
        color: COLOR.light.primary,
        fontSize: 18,
        fontWeight: "bold",
    },
    card: {
        backgroundColor: COLOR.light.light,
    },
});