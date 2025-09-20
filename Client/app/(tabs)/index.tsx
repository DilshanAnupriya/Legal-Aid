import { StyleSheet, ScrollView, View } from 'react-native';
import { useState } from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";
import StackNavigator from "@/app/navigation/stack-navigation/StackNavigator";
import { ThemeProvider } from '@/context/ThemeContext';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <ThemeProvider>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
          {isLoading ? (
            <SplashScreen onFinish={() => setIsLoading(false)} />
          ) : (
            <StackNavigator />
          )}
        </View>
      </ScrollView>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
