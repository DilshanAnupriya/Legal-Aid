import React, {useEffect, useRef} from 'react'
import {Text, StyleSheet, Animated, View, Image, Dimensions} from 'react-native'
import {COLOR} from "@/constants/ColorPallet";
import appJson from "../../../app.json";

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
    const fadeAnim = useRef(new Animated.Value(0)).current
    const scaleAnim = useRef(new Animated.Value(0.8)).current
    const slideAnim = useRef(new Animated.Value(20)).current
    const progress = useRef(new Animated.Value(0)).current
    const progressOpacity = useRef(new Animated.Value(0)).current
    const bottomFade = useRef(new Animated.Value(0)).current

    useEffect(() => {
        const animationSequence = Animated.sequence([
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                }),
                Animated.timing(scaleAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true
                })
            ]),
            Animated.parallel([
                Animated.timing(slideAnim, {
                    toValue: 0,
                    duration: 400,
                    useNativeDriver: true
                }),
                Animated.timing(progress, {
                    toValue: 100,
                    duration: 1200,
                    useNativeDriver: false
                }),
                Animated.timing(progressOpacity, {
                    toValue: 1,
                    duration: 400,
                    useNativeDriver: true
                })
            ]),
            Animated.timing(bottomFade, {
                toValue: 1,
                duration: 400,
                useNativeDriver: true
            })
        ])

        animationSequence.start(() => {
            setTimeout(() => {
                onFinish();
            }, 500);
        });
    }, [onFinish]);

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
                        Our <Text style={{color:COLOR.light.accent}}>Mission</Text>
                    </Text>
                    <View style={styles.underline} />
                </Animated.View>

                <Animated.View
                    style={[
                        styles.progressSection,
                        {opacity: progressOpacity}
                    ]}
                >
                    <Text style={styles.loadingText}>Loading...</Text>
                    <View style={styles.progressContainer}>
                        <Animated.View
                            style={[
                                styles.progressbar,
                                {
                                    width: progress.interpolate({
                                        inputRange: [0, 100],
                                        outputRange: ['0%', '100%']
                                    })
                                }
                            ]}
                        />
                        <View style={styles.progressGlow} />
                    </View>
                </Animated.View>
                <Animated.View
                    style={[
                        styles.bottom,
                        {opacity: bottomFade}
                    ]}
                >
                    <View style={styles.bottomLeft}>
                        <Text style={styles.versionText}>Version {appJson.expo.version}</Text>
                    </View>
                    <View style={styles.bottomRight}>
                        <Text style={styles.fromText}>From SLIIT</Text>
                    </View>
                </Animated.View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: COLOR.light.primary,
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
        width: Dimensions.get('window').width * 0.7,
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
        backgroundColor: COLOR.light.accent,
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
        backgroundColor: COLOR.light.orange,
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
});
