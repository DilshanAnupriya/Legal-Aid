import { StyleSheet, View,Text } from 'react-native';
import {useEffect, useState} from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";
import StackNavigator from "@/app/navigation/stack-navigation/StackNavigator";
import HomePageScreen from "@/components/ui/screen/HomePageScreen";
import { ThemeProvider } from '../../context/ThemeContext';




export default function HomeScreen() {

  const [isLoading, setIsLoading] = useState(true);



  return (
    <ThemeProvider>

    
      <View style={styles.container}>
        {isLoading ? (
            <SplashScreen onFinish={()=>{setIsLoading(false)}}/>
        ) : (
            <StackNavigator/>
        )}
      </View>
    </ThemeProvider>
  );
}


const styles = StyleSheet.create({

  container: {
    flex: 1,
  },
  text: {
    fontSize: 18,
    color: "blue",
    fontWeight: "600",
    
  }
})