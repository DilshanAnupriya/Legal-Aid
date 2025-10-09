import { Image, TouchableOpacity, View, Text, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import ForumScreen from "@/components/ui/screen/ForumScreen";
import DocumentScreen from "@/components/ui/screen/DocumentScreen";
import LawyerScreen from "@/components/ui/screen/LawyerScreen";
import MenuScreen from "@/components/ui/screen/MenuScreen";
import LawyerCaseScreen from "@/components/ui/screen/LawyerCases"; 
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import ThemeSwitcherComponent from '../../../components/modals/ThemeSwitcher';
import { COLOR } from "@/constants/ColorPallet";

const DarkLogo = require("../../../assets/images/logo/Law Firm Logo Black and White (1).png");
const WhiteLogo = require("../../../assets/images/logo/img.png");
const Tab = createBottomTabNavigator();

import LawyerDashboard from "@/components/ui/screen/LawyerDashboard"; 

export default function HomeBottomTabNavigation({ navigation }: any) {
  const { colors, theme } = useTheme();
  const { user } = useAuth();
  const userRole = user?.role || "user"; // default to 'user'

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
        console.log('Unknown user role:', user.role);
    }
  };

  const navigateToChat = () => {
    console.log("navigate to chat pressed..")
    navigation.navigate('ChatScreen');
  }

  /** Reusable header components */
  const commonHeaderOptions = {
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
  };

  /** User bottom tabs */
  const UserTabs = () => (
    <Tab.Navigator
      initialRouteName={'Home'}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Forum') iconName = focused ? 'chatbox' : 'chatbox-outline';
          else if (route.name === 'Documents') iconName = focused ? 'document' : 'document-outline';
          else if (route.name === 'Lawyer') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Menu') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.primary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
          borderTopWidth: 1,
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
              <Image
                source={theme === 'light' ? DarkLogo : WhiteLogo}
                resizeMode="contain"
                style={styles.logo}
              />
            </View>
          ),
          headerTitle: '',
          headerRight: () => (
            <View style={styles.headerRightContainer}>
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
              >
                <Ionicons name="search-outline" size={20} color={colors.primary} />
              </TouchableOpacity>
              <ThemeSwitcherComponent size="small" />
              <TouchableOpacity
                style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
              >
                <Ionicons name="notifications-outline" size={20} color={colors.primary} />
                <View style={[styles.notificationBadge, { backgroundColor: '#FF6B35' }]}>
                  <Text style={styles.badgeText}>3</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.profileButton, {
                  backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray,
                  borderColor: '#FF6B35'
                }]}
                onPress={navigateToProfile}
              >
                <Ionicons name="person" size={18} color={'#FF6B35'} />
              </TouchableOpacity>
              {/* Chat / Messenger Icon */}
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray, marginRight: 5 }]}
          onPress={navigateToChat}
        >
          <Ionicons name="chatbubble-ellipses-outline" size={20} color={colors.primary} />
        </TouchableOpacity>

            </View>
          ),
        }}
      />
      <Tab.Screen name={'Documents'} component={DocumentScreen} options={{ ...commonHeaderOptions, headerTitle: 'Documents' }} />
      <Tab.Screen name={'Forum'} component={ForumScreen} options={{ ...commonHeaderOptions, headerTitle: 'Legal Forum' }} />
      <Tab.Screen name={'Lawyer'} component={LawyerScreen} options={{ ...commonHeaderOptions, headerTitle: 'Find Lawyers' }} />
      <Tab.Screen name={'Menu'} component={MenuScreen} options={{ ...commonHeaderOptions, headerTitle: 'Menu' }} />
    </Tab.Navigator>
  );

  /** Lawyer bottom tabs (different layout) */
  const LawyerTabs = () => (
    <Tab.Navigator
      initialRouteName={'Dashboard'}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, focused }) => {
          let iconName;
          if (route.name === 'Dashboard') iconName = focused ? 'home' : 'grid-outline';
          else if (route.name === 'Cases') iconName = focused ? 'briefcase' : 'briefcase-outline';
          else if (route.name === 'Documents') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Forum') iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          else if (route.name === 'Menu') iconName = focused ? 'menu' : 'menu-outline';
          return <Ionicons name={iconName as any} size={22} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.primary,
        tabBarStyle: {
          backgroundColor: colors.white,
          borderTopColor: theme === 'light' ? '#F5F5F7' : colors.darkgray,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 8,
          paddingTop: 8,
        },
      })}
    >
      <Tab.Screen
  name={'Dashboard'}
  component={LawyerDashboard}
  options={{
    ...commonHeaderOptions,
    headerTitle: 'Dashboard',
    headerRight: () => (
      <View style={styles.headerRightContainer}>
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
        >
          <Ionicons name="search-outline" size={20} color={colors.primary} />
        </TouchableOpacity>
        <ThemeSwitcherComponent size="small" />
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray }]}
        >
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <View style={[styles.notificationBadge, { backgroundColor: '#FF6B35' }]}>
            <Text style={styles.badgeText}>3</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.profileButton, {
            backgroundColor: theme === 'light' ? COLOR.light.white : colors.darkgray,
            borderColor: '#FF6B35'
          }]}
          onPress={navigateToProfile}
        >
          <Ionicons name="person" size={18} color={'#FF6B35'} />
        </TouchableOpacity>
      </View>
    ),
  }}
/>

      <Tab.Screen name={'Cases'} component={LawyerCaseScreen} options={{ ...commonHeaderOptions, headerTitle: 'My Cases' }} />
      <Tab.Screen name={'Documents'} component={DocumentScreen} options={{ ...commonHeaderOptions, headerTitle: 'Documents' }} />
      <Tab.Screen name={'Forum'} component={ForumScreen} options={{ ...commonHeaderOptions, headerTitle: 'Forum' }} />
      <Tab.Screen name={'Menu'} component={MenuScreen} options={{ ...commonHeaderOptions, headerTitle: 'Menu' }} />
    </Tab.Navigator>
  );

  return userRole === "lawyer" ? <LawyerTabs /> : <UserTabs />;
}


const styles = StyleSheet.create({
  headerLeftContainer: { flexDirection: "row", alignItems: "center", paddingLeft: 16 },
  logo: { width: 62, height: 72 },
  headerRightContainer: { flexDirection: "row", alignItems: "center", paddingRight: 16, gap: 16 },
  iconButton: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  profileButton: { width: 36, height: 36, borderRadius: 10, justifyContent: "center", alignItems: "center", borderWidth: 1.5 },
  notificationBadge: { position: "absolute", top: -2, right: -2, width: 16, height: 16, borderRadius: 8, justifyContent: "center", alignItems: "center" },
  badgeText: { color: "white", fontSize: 10, fontWeight: "700" },
});
