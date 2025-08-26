import { Image, TouchableOpacity, View } from 'react-native';
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import ForumScreen from "@/components/ui/screen/ForumScreen";
import LawyerScreen from "@/components/ui/screen/LawyerScreen";
import ProfileScreen from "@/components/ui/screen/ProfileScreen";
import { Ionicons } from "@expo/vector-icons";
import { COLOR } from "@/constants/ColorPallet";

const logo = require('../../../assets/images/logo/Law Firm Logo Black and White (1).png');
const Tab = createBottomTabNavigator();



export default function HomeBottomTabNavigation({ navigation }: any) {
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
                    backgroundColor: COLOR.white, // or any background you want
                    // shadowColor: 'transparent',   // removes shadow on iOS
                    elevation: 0, 
                    height: 120,    
                                    // removes shadow/elevation on Android
                },
                headerTintColor: COLOR.primary,
                tabBarActiveTintColor: COLOR.accent,
                tabBarInactiveTintColor: COLOR.secondary,
            })}
        >
            <Tab.Screen
                name={'Home'}
                component={HomePageScreen}
                options={{
                    headerLeft: () => (
                        <Image
                            source={logo}
                            resizeMode="contain"
                            style={{
                                width: 160,   // ⬅️ Increased width
                                height: 100,  // ⬅️ Increased height
                                marginLeft: 5,
                            }}
                        />
                    ),
                    headerTitle: '',
                    headerRight: () => (
                        <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 15 }}>
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
                                    color={COLOR.primary || '#333'}
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
                                    color={COLOR.primary || '#333'}
                                />
                            </TouchableOpacity>
                        </View>
                    ),
                }}
            />
            <Tab.Screen name={'Forum'} component={ForumScreen} />
            <Tab.Screen name={'Lawyer'} component={LawyerScreen} />
            <Tab.Screen name={'Profile'} component={ProfileScreen} />
        </Tab.Navigator>
    );
}
