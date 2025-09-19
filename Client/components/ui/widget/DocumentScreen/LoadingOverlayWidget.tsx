import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  ActivityIndicator,
} from 'react-native';

interface LoadingOverlayWidgetProps {
  visible: boolean;
  message?: string;
  progress?: number;
  theme: string;
  colors: any;
}

const LoadingOverlayWidget: React.FC<LoadingOverlayWidgetProps> = ({
  visible,
  message = 'Loading...',
  progress,
  theme,
  colors,
}) => {
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: colors.white }]}>
          <ActivityIndicator 
            size="large" 
            color={colors.accent} 
            style={styles.spinner}
          />
          
          <Text style={[styles.message, { color: colors.primary }]}>
            {message}
          </Text>
          
          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { backgroundColor: colors.darkgray + '30' }]}>
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: colors.accent,
                      width: `${progress}%`,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.progressText, { color: colors.darkgray }]}>
                {progress}%
              </Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  spinner: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default LoadingOverlayWidget;