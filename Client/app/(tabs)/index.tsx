import { StyleSheet, ScrollView, View } from 'react-native';
import { useState } from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from "@/context/AuthContext";
import AuthNavigator from "@/app/navigation/stack-navigation/AuthStackNavigator";
// Initialize i18n
import '@/i18n';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <AuthProvider>
      <ThemeProvider>
        <ScrollView 
          style={styles.container} 
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {isLoading ? (
            <SplashScreen onFinish={() => setIsLoading(false)} />
          ) : (
            <AuthNavigator />
          )}
        </ScrollView>
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  }
});
