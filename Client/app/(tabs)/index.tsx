
import { StyleSheet, View,Text } from 'react-native';
import {useEffect, useState} from "react";
import SplashScreen from "@/components/ui/screen/SplashScreen";



export default function HomeScreen() {

    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 2000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            {isLoading ? (
                <SplashScreen/>
            ) : (
                <Text style={styles.text}>Welcome to Legal Aid 🚀</Text>
            )}
        </View>
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
    },
});
