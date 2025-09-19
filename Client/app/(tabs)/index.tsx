
import { StyleSheet, View } from 'react-native';
import { useState } from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import { ThemeProvider } from '@/context/ThemeContext';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  return (
    <ThemeProvider>
      <View style={styles.container}>
        {isLoading ? (
            <SplashScreen onFinish={()=>{setIsLoading(false)}}/>
        ) : (
            <HomePageScreen/>
        )}
      </View>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

