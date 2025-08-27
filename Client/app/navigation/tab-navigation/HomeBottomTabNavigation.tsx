import { Image, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import ForumScreen from "@/components/ui/screen/ForumScreen";
import LawyerScreen from "@/components/ui/screen/LawyerScreen";
import ProfileScreen from "@/components/ui/screen/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../../../context/ThemeContext';
import ThemeSwitcher from '../../../components/modals/ThemeSwitcher'; // Adjust path as needed

const DarkLogo = require('../../../assets/images/logo/Law Firm Logo Black and White (1).png');
const WhiteLogo = require('../../../assets/images/logo/img.png');
const Tab = createBottomTabNavigator();

export default function HomeBottomTabNavigation({ navigation }: any) {
    const { colors, theme } = useTheme(); // Get current theme colors and theme state
    
    return (
        <Tab.Navigator
            initialRouteName={'Home'}
            screenOptions={({ route, focused }: any) => ({
                tabBarIcon: ({ color }) => {
                    let iconName;
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    else if (route.name === 'Forum') iconName = focused ? 'earth' : 'earth-outline';
                    else if (route.name === 'Lawyer') iconName = focused ? 'briefcase' : 'briefcase-outline';
                    else if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';

                    return <Ionicons name={iconName as any} size={22} color={color} />;
                },
                headerStyle: {
                    backgroundColor: colors.white, // This will now change based on theme
                    elevation: 0, 
                    height: 120,    
                },
                headerTintColor: colors.primary,
                tabBarActiveTintColor: colors.accent,
                tabBarInactiveTintColor: colors.primary,
                // Add tab bar styling for dark mode
                tabBarStyle: {
                    backgroundColor: colors.white,
                    borderTopColor: colors.darkgray, // Use a more visible border color
                    borderTopWidth: 0.5,
                    shadowColor: colors.shadow, // Add shadow for better separation
                    elevation: 5, // Android shadow
                },
            })}
        >
            <Tab.Screen
                name={'Home'}
                component={HomePageScreen}
                options={{
                    headerLeft: () => (
                        <Image
                            source={theme === 'light' ? DarkLogo : WhiteLogo}
                            resizeMode="contain"
                            style={{
                                width: 160,
                                height: 100,
                                marginLeft: 5,
                            }}
                        />
                    ),
                    headerTitle: '',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
                            {/* Theme Switcher */}
                            <ThemeSwitcher 
                                style={{ marginRight: 20 }}
                                size="small"
                            />

                            {/* Bell icon */}
                            <TouchableOpacity
                                style={{ marginRight: 20, padding: 6 }}
                                onPress={() => {
                                    console.log('Bell icon pressed');
                                }}
                            >
                                <Ionicons
                                    name="notifications-outline"
                                    size={24}
                                    color={colors.primary || '#333'}
                                />
                            </TouchableOpacity>

                            {/* Menu icon */}
                            <TouchableOpacity
                                style={{ padding: 6 }}
                                onPress={() => {
                                    console.log('Menu icon pressed');
                                }}
                            >
                                <Ionicons
                                    name="menu"
                                    size={24}
                                    color={colors.primary || '#333'}
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
                        elevation: 0,
                        height: 120,
                    },
                    headerTintColor: colors.primary,
                }}
            />
            <Tab.Screen 
                name={'Lawyer'} 
                component={LawyerScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 0,
                        height: 120,
                    },
                    headerTintColor: colors.primary,
                }}
            />
            <Tab.Screen 
                name={'Profile'} 
                component={ProfileScreen}
                options={{
                    headerStyle: {
                        backgroundColor: colors.white,
                        elevation: 0,
                        height: 120,
                    },
                    headerTintColor: colors.primary,
                }}
            />
        </Tab.Navigator>
    );
}