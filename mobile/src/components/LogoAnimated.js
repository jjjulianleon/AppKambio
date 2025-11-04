import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Polygon } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

const AnimatedView = Animated.createAnimatedComponent(View);

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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    };
  });

  // Simple triangle points for arrows
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const arrowSize = size * 0.12;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <View style={styles.centerCircleContainer}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Center circle */}
          <Circle
            cx={centerX}
            cy={centerY}
            r={size * 0.15}
            fill={colors.primary}
          />
        </Svg>
      </View>

      {/* Rotating arrows */}
      <AnimatedView style={[styles.arrowsContainer, animatedStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.arrowSvg}>
          {/* Arrow 1 - pointing up */}
          <Polygon
            points={`${centerX},${centerY - radius - arrowSize} ${centerX - arrowSize / 2},${centerY - radius} ${centerX + arrowSize / 2},${centerY - radius}`}
            fill={colors.primary}
          />

          {/* Arrow 2 - pointing 120 degrees */}
          <Polygon
            points={`${centerX + (radius + arrowSize) * Math.cos(Math.PI / 6)},${centerY + (radius + arrowSize) * Math.sin(Math.PI / 6)} ${centerX + radius * Math.cos(Math.PI / 6) - arrowSize / 4},${centerY + radius * Math.sin(Math.PI / 6) + arrowSize / 2} ${centerX + radius * Math.cos(Math.PI / 6) + arrowSize / 4},${centerY + radius * Math.sin(Math.PI / 6) - arrowSize / 2}`}
            fill={colors.secondary}
          />

          {/* Arrow 3 - pointing 240 degrees */}
          <Polygon
            points={`${centerX + (radius + arrowSize) * Math.cos(7 * Math.PI / 6)},${centerY + (radius + arrowSize) * Math.sin(7 * Math.PI / 6)} ${centerX + radius * Math.cos(7 * Math.PI / 6) - arrowSize / 4},${centerY + radius * Math.sin(7 * Math.PI / 6) - arrowSize / 2} ${centerX + radius * Math.cos(7 * Math.PI / 6) + arrowSize / 4},${centerY + radius * Math.sin(7 * Math.PI / 6) + arrowSize / 2}`}
            fill={colors.primary}
          />
        </Svg>
      </AnimatedView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  centerCircleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  arrowsContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1
  },
  arrowSvg: {
    position: 'absolute'
  }
});

export default LogoAnimated;
