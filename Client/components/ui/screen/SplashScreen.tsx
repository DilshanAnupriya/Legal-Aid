import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { COLOR } from '@/constants/ColorPallet';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      onFinish();
    }, 2000); // 2 seconds

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <Image 
        source={require('@/assets/images/logo/img.png')} 
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Legal Aid</Text>
      <Text style={styles.subtitle}>Your Legal Assistant</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.light.white,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLOR.light.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLOR.light.secondary,
    textAlign: 'center',
  },
});