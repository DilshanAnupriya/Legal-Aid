import { Image, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import ForumScreen from "@/components/ui/screen/ForumScreen";
import DocumentScreen from "@/components/ui/screen/DocumentScreen";
import LawyerScreen from "@/components/ui/screen/LawyerScreen";
import MenuScreen from "@/components/ui/screen/MenuScreen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '@/context/ThemeContext';
import ThemeSwitcher from '../../../components/modals/ThemeSwitcher';
import { COLOR } from "@/constants/ColorPallet";

const DarkLogo = require('../../../assets/images/logo/Law Firm Logo Black and White (1).png');
const WhiteLogo = require('../../../assets/images/logo/img.png');
const Tab = createBottomTabNavigator();

export default function HomeBottomTabNavigation({ navigation }: any) {
    const { colors, theme } = useTheme();

    return (
        <Tab.Navigator
            initialRouteName={'Home'}
            screenOptions={({ route, focused }: any) => ({
                tabBarIcon: ({ color }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Forum') iconName = focused ? 'earth' : 'earth-outline';
                    else if (route.name === 'Documents') iconName = focused ? 'document' : 'document-outline';
                    else if (route.name === 'Lawyer') iconName = focused ? 'briefcase' : 'briefcase-outline';
                    else if (route.name === 'Menu') iconName = focused ? 'menu' : 'menu-outline';

                    return <Ionicons name={iconName as any} size={22} color={color} />;
                },
                headerStyle: {
                    backgroundColor: colors.white,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    height: 90,
                    borderBottomWidth: 1,
                    borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,

                },
                headerTintColor: colors.primary,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.primary,
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    borderTopWidth: 1,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.05,
                    shadowRadius: 8,
                    elevation: 8,
                    height: 65,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
            })}
        >
            <Tab.Screen
                name={'Home'}
                component={HomePageScreen}
                options={{
                    headerLeft: () => (
                        <View style={styles.headerLeftContainer}>
                            <View style={styles.logoContainer}>
                                <Image
                                    source={theme === 'light' ? DarkLogo : WhiteLogo}
                                    resizeMode="contain"
                                    style={styles.logo}
                                />
                            </View>
                        </View>
                    ),
                    headerTitle: '',
                    headerRight: () => (
                        <View style={styles.headerRightContainer}>
                            {/* Search Icon */}
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
                                onPress={() => {
                                    console.log('Search pressed');
                                }}
                            >
                                <Ionicons
                                    name="search-outline"
                                    size={20}
                                    color={colors.primary}
                                />
                            </TouchableOpacity>

                            {/* Theme Switcher */}
                            <View style={styles.themeSwitcherContainer}>
                                <ThemeSwitcher size="small" />
                            </View>

                            {/* Notifications */}
                            <TouchableOpacity
                                style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
                                onPress={() => {
                                    console.log('Notifications pressed');
                                }}
                            >
                                <Ionicons
                                    name="notifications-outline"
                                    size={20}
                                    color={colors.primary}
                                />
                                {/* Notification badge */}
                                <View style={[styles.notificationBadge, { backgroundColor: COLOR.light.orange || '#FF6B35' }]}>
                                    <Text style={styles.badgeText}>3</Text>
                                </View>
                            </TouchableOpacity>

                            {/* Profile Menu */}
                            <TouchableOpacity
                                style={[styles.profileButton, {
                                    backgroundColor: theme === 'light' ? COLOR.light.white: colors.darkgray,
                                    borderColor: COLOR.light.orange || '#FF6B35'
                                }]}
                                onPress={() => {
                                    console.log('Profile menu pressed');
                                }}
                            >
                                <Ionicons
                                    name="person"
                                    size={18}
                                    color={COLOR.light.orange || '#FF6B35'}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Tab.Screen
                name={'Forum'}
                component={ForumScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Legal Forum',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />
            <Tab.Screen
                name={'Documents'}
                component={DocumentScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Documents',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />
            <Tab.Screen
                name={'Lawyer'}
                component={LawyerScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Find Lawyers',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />
            <Tab.Screen
                name={'Menu'}
                component={MenuScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 8,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.05,
                        shadowRadius: 8,
                        height: 90,
                        borderBottomWidth: 1,
                        borderBottomColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
                    },
                    headerTintColor: colors.primary,
                    headerTitle: 'Menu',
                    headerTitleStyle: {
                        fontSize: 18,
                        fontWeight: '600',
                        color: colors.primary,
                    },
                }}
            />
        </Tab.Navigator>
    );
}

const styles = StyleSheet.create({
    headerLeftContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 16,
        height: 90,
        flex: 1,
        marginBottom:40
    },
    logoContainer: {
        width: 44,
        height: 44,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 3,
    },
    logo: {
        width: 62,
        height: 72,
    },

    headerRightContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingRight: 16,
        height: 90,
        gap: 20,
        marginBottom:40,
    },
    iconButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 1,
    },
    profileButton: {
        width: 36,
        height: 36,
        borderRadius: 10,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        elevation: 1,
    },
    themeSwitcherContainer: {
        marginHorizontal: 2,
    },
    notificationBadge: {
        position: 'absolute',
        top: -2,
        right: -2,
        width: 16,
        height: 16,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        shadowRadius: 2,
        elevation: 2,
    },
    badgeText: {
        color: 'white',
        fontSize: 10,
        fontWeight: '700',
    },
});
