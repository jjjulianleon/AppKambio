import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const LogoAnimated = ({ size = 120, speed = 3000, colors = { primary: '#6B4CE6', secondary: '#00D9FF' } }) => {
  const rotation = useSharedValue(0);

  useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, {
        duration: speed,
        easing: Easing.linear
      }),
      -1, // Infinite repeat
      false
    );
  }, [speed]);

  // Create arrow path - pointing upward triangle
  const createArrowPath = (angle) => {
    const centerX = size / 2;
    const centerY = size / 2;
    const radius = size * 0.35;
    const arrowWidth = size * 0.08;
    const arrowHeight = size * 0.25;

    // Calculate position on circle
    const rad = (angle * Math.PI) / 180;
    const x = centerX + radius * Math.cos(rad - Math.PI / 2);
    const y = centerY + radius * Math.sin(rad - Math.PI / 2);

    // Arrow pointing outward
    const tipX = centerX + (radius + arrowHeight) * Math.cos(rad - Math.PI / 2);
    const tipY = centerY + (radius + arrowHeight) * Math.sin(rad - Math.PI / 2);

    // Calculate perpendicular for arrow base
    const perpAngle = rad;
    const baseLeftX = x + arrowWidth * Math.cos(perpAngle);
    const baseLeftY = y + arrowWidth * Math.sin(perpAngle);
    const baseRightX = x - arrowWidth * Math.cos(perpAngle);
    const baseRightY = y - arrowWidth * Math.sin(perpAngle);

    return `M ${baseLeftX} ${baseLeftY} L ${tipX} ${tipY} L ${baseRightX} ${baseRightY} Z`;
  };

  const animatedProps1 = useAnimatedProps(() => {
    return {
      d: createArrowPath(rotation.value)
    };
  });

  const animatedProps2 = useAnimatedProps(() => {
    return {
      d: createArrowPath(rotation.value + 120)
    };
  });

  const animatedProps3 = useAnimatedProps(() => {
    return {
      d: createArrowPath(rotation.value + 240)
    };
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Center circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={size * 0.15}
          fill={colors.primary}
        />

        {/* Three rotating arrows */}
        <AnimatedPath
          animatedProps={animatedProps1}
          fill={colors.primary}
        />
        <AnimatedPath
          animatedProps={animatedProps2}
          fill={colors.secondary}
        />
        <AnimatedPath
          animatedProps={animatedProps3}
          fill={colors.primary}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default LogoAnimated;
