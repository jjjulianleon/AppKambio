import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import { COLORS, FONT_SIZES } from '../utils/constants';
import { formatCurrency, formatPercentage } from '../utils/helpers';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({ 
  progress = 0, 
  size = 200, 
  strokeWidth = 20,
  current = 0,
  target = 100
}) => {
  const animatedProgress = useSharedValue(0);
  
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const centerX = size / 2;
  const centerY = size / 2;

  useEffect(() => {
    animatedProgress.value = withTiming(progress, {
      duration: 1500,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1)
    });
  }, [progress]);

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = circumference - (circumference * animatedProgress.value) / 100;
    return {
      strokeDashoffset
    };
  });

  // Determinar color según progreso
  const getProgressColor = () => {
    if (progress >= 100) return COLORS.success;
    if (progress >= 75) return COLORS.gold; // Using constant now
    if (progress >= 50) return COLORS.primary;
    return COLORS.secondary;
  };

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke={COLORS.border}
          strokeWidth={strokeWidth}
          fill="none"
        />
        
        {/* Progress circle */}
        <AnimatedCircle
          cx={centerX}
          cy={centerY}
          r={radius}
          stroke={getProgressColor()}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          rotation="-90"
          origin={`${centerX}, ${centerY}`}
        />
      </Svg>

      {/* Center text */}
      <View style={styles.centerContent}>
        <Text style={styles.percentageText}>
          {formatPercentage(Math.round(progress))}
        </Text>
        <Text style={styles.amountText}>
          {formatCurrency(current)}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  centerContent: {
    position: 'absolute',
    alignItems: 'center'
  },
  percentageText: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -1
  },
  amountText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: 4
  }
});

export default ProgressRing;
