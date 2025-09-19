import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeBottomTabNavigation from "@/app/navigation/tab-navigation/HomeBottomTabNavigation";
import { COLOR } from "@/constants/ColorPallet";
import NgoScreen from "@/components/ui/screen/menu/NgoScreen";

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
        </Stack.Navigator>
    );
}


//styles
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