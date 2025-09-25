import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { StepIndicatorProps } from '../../types/signup';

const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, totalSteps }) => {
  const { colors } = useTheme();

  const styles = StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 16,
    },
    stepDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      marginHorizontal: 4,
    },
    stepDotActive: {
      backgroundColor: colors.accent,
    },
    stepDotInactive: {
      backgroundColor: colors.darkgray,
    },
    stepLine: {
      width: 30,
      height: 2,
      backgroundColor: colors.darkgray,
      marginHorizontal: 4,
    },
  });

  return (
    <View style={styles.container}>
      {Array.from({ length: totalSteps }, (_, index) => (
        <React.Fragment key={index}>
          <View
            style={[
              styles.stepDot,
              index < currentStep ? styles.stepDotActive : styles.stepDotInactive,
            ]}
          />
          {index < totalSteps - 1 && <View style={styles.stepLine} />}
        </React.Fragment>
      ))}
    </View>
  );
};

export default StepIndicator;