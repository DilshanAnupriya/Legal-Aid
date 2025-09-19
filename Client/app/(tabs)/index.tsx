
import { StyleSheet, View } from 'react-native';
import { useState } from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import { ThemeProvider } from '@/context/ThemeContext';
import StackNavigator from "@/app/navigation/stack-navigation/StackNavigator";
import {AuthProvider} from "@/context/AuthContext";
import AuthNavigator from "@/app/navigation/stack-navigation/AuthStackNavigator";

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);
  return (
      <AuthProvider>
    <ThemeProvider>
      <View style={styles.container}>
        {isLoading ? (
            <SplashScreen onFinish={()=>{setIsLoading(false)}}/>
        ) : (
            <AuthNavigator/>
        )}
      </View>
    </ThemeProvider>
      </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});

