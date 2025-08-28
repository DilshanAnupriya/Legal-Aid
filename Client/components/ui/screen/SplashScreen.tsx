
import React, {useEffect, useRef} from 'react'
import {Text, StyleSheet, Animated, View, Image, Dimensions} from 'react-native'
import {COLOR} from "@/constants/ColorPallet";
import appJson from "../../../app.json";
import { Colors } from 'react-native/Libraries/NewAppScreen';

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


    return (
        <View style={styles.container}>
            <View style={styles.gradientOverlay} />
                <Animated.View
                    style={[
                        styles.logoWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{scale: scaleAnim}]
                        }
                    ]}
                >
                    <View style={styles.logoContainer}>
                        <Image
                            style={styles.logo}
                            source={require('../../../assets/images/logo/img.png')}
                            resizeMode={'contain'}
                        />
                    </View>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.taglineWrapper,
                        {
                            opacity: fadeAnim,
                            transform: [{translateY: slideAnim}]
                        }
                    ]}
                >
                    <Text style={styles.tagline}>
                        Your Rights 
                    </Text>
                    <Text style={styles.taglineSecond}>
                        Our <Text style={{color:COLOR.accent}}>Mission</Text>
                    </Text>
                    <View style={styles.underline} />
                </Animated.View>

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
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLOR.primary,
        position: 'relative',
    },
    gradientOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    },
    logoWrapper: {
        alignItems: 'center',
        marginBottom: 40,
    },
    logoContainer: {
        backgroundColor: 'transparent',
        borderRadius: 20,
        padding: 20,
    },
    logo: {
        height: 280,
        width: width * 0.7,
    },
    taglineWrapper: {
        alignItems: 'center',
        paddingHorizontal: 40,
        marginBottom: 60,
    },
    tagline: {
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 30,
        letterSpacing: 0.5,
    },
    taglineSecond: {
        fontSize: 22,
        fontWeight: '600',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 30,
        letterSpacing: 0.5,
        marginTop: 2,
    },
    underline: {
        width: 60,
        height: 3,
        backgroundColor: COLOR.accent,
        borderRadius: 2,
        marginTop: 12,
    },
    progressSection: {
        alignItems: 'center',
        width: '100%',
    },
    loadingText: {
        fontSize: 16,
        color: '#b8bcc8',
        marginBottom: 15,
        fontWeight: '500',
        letterSpacing: 0.5,
    },
    progressContainer: {
        width: '70%',
        height: 6,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 10,
        overflow: 'hidden',
        position: 'relative',
    },
    progressbar: {
        backgroundColor: COLOR.orange,
        height: '100%',
        borderRadius: 10,
        position: 'relative',
    },
    progressGlow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(211, 84, 0, 0.3)',
        borderRadius: 10,
    },
    bottom: {
        width: '100%',
        position: "absolute",
        bottom: 0,
        flexDirection: 'row',
        paddingHorizontal: 25,
        paddingVertical: 25,
        justifyContent: 'space-between',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
    },
    bottomLeft: {
        flex: 1,
    },
    bottomRight: {
        flex: 1,
        alignItems: 'flex-end',
    },
    versionText: {
        fontSize: 14,
        color: '#b8bcc8',
        fontWeight: '500',
        letterSpacing: 0.3,
    },
    fromText: {
        fontSize: 14,
        color: '#b8bcc8',
        fontWeight: '600',
        letterSpacing: 0.3,
    },

  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLOR.white,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLOR.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: COLOR.secondary,
    textAlign: 'center',
  },

});
