import React from 'react';
import { StyleSheet, Text, View, ActivityIndicator } from 'react-native';

// @ts-ignore
const LoadingOverlay = ({ visible, message = "Loading NGOs..." }) => {
    if (!visible) return null;

    return (
        <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#007AFF" />
            <Text style={styles.loadingText}>{message}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    loadingOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 8,
        fontSize: 14,
        color: '#666',
    },
});

export default LoadingOverlay;