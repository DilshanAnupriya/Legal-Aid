import React from 'react'
import { Text,StyleSheet } from 'react-native'

export default function SplashScreen() {
    return (
        <Text style={styles.homeText}>
            Splash screen
        </Text>
    )
}



const styles = StyleSheet.create({
    homeText:{
        color:'red'
    }
})