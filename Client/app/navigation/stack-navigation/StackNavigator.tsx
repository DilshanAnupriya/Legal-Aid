import { StyleSheet } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import HomeBottomTabNavigation from "@/app/navigation/tab-navigation/HomeBottomTabNavigation";
import { COLOR } from "@/constants/ColorPallet";

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
        name="Process"
        component={HomeBottomTabNavigation}
        options={{
          headerLeft: () => null,
          headerShown: false, // Hide header if needed
        }}
      />
    </Stack.Navigator>
  );
}


//styles
const styles = StyleSheet.create({
  header: {
    backgroundColor: COLOR.primary, // example primary color
    shadowColor: "transparent", // removes shadow on iOS
    elevation: 0, // removes shadow on Android
  },
  headerTitle: {
    color: COLOR.white,
    fontSize: 18,
    fontWeight: "bold",
  },
  card: {
    backgroundColor: COLOR.light, // screen background color
  },
});
