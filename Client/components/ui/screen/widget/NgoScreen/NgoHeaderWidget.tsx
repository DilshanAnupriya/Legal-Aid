import React from 'react';
import { StyleSheet, Text, View, Dimensions, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import {COLOR} from "@/constants/ColorPallet";

const { width } = Dimensions.get('window');

const NgoHeaderWidget = () => {
    const fadeAnim = React.useRef(new Animated.Value(0)).current;

    React.useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, [fadeAnim]);

    const renderContent = () => (
        <Animated.View style={[styles.contentContainer, { opacity: fadeAnim }]}>
            <View style={styles.titleSection}>
                <Text style={styles.headerSubtitle}>Empowering Communities, Transforming Lives</Text>
            </View>
        </Animated.View>
    );

    return (
        <View style={styles.minimalHeader}>
            {renderContent()}
        </View>
    );
};

const styles = StyleSheet.create({
    minimalHeader: {
        backgroundColor: '#f0f0f0',
        width: '100%',
    },
    contentContainer: {
        justifyContent: "center",
        alignItems: "center",
        height: 150,
        backgroundColor: COLOR.light.darkblue,
        width: '100%',
         borderBottomLeftRadius:16,
         borderBottomRightRadius:16,

    },
    titleSection: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',


    },
    headerSubtitle: {
        fontSize: 22,
        color: 'white',
        textAlign: 'center',
        width: '100%',
        paddingHorizontal: 20,
        fontWeight: '900',
    },

});

export default NgoHeaderWidget;