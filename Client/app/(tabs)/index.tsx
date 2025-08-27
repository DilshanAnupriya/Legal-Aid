import { StyleSheet, View } from 'react-native';
import { useState } from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <View style={styles.container}>
      {isLoading ? (
        <SplashScreen onFinish={() => { setIsLoading(false) }} />
      ) : (
        <HomePageScreen />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});