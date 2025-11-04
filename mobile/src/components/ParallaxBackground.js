import React from 'react';
import { StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect, Polygon } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const ParallaxBackground = ({
  scrollOffset,
  gradientStart = '#6B4CE6',
  gradientEnd = '#00D9FF'
}) => {
  // Animated styles for different layers with parallax effect
  const layer1Style = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollOffset?.value || 0,
      [0, height],
      [0, -height * 0.3]
    );
    return {
      transform: [{ translateY }]
    };
  });

  const layer2Style = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollOffset?.value || 0,
      [0, height],
      [0, -height * 0.5]
    );
    return {
      transform: [{ translateY }]
    };
  });

  const layer3Style = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollOffset?.value || 0,
      [0, height],
      [0, -height * 0.7]
    );
    return {
      transform: [{ translateY }]
    };
  });

  return (
    <Animated.View style={styles.container}>
      {/* Base gradient background */}
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Layer 1 - Back layer with large shapes */}
      <Animated.View style={[styles.layer, layer1Style]}>
        <Svg width={width} height={height} style={styles.svg}>
          <Circle
            cx={width * 0.2}
            cy={height * 0.15}
            r={80}
            fill="rgba(255, 255, 255, 0.05)"
          />
          <Circle
            cx={width * 0.8}
            cy={height * 0.7}
            r={120}
            fill="rgba(255, 255, 255, 0.03)"
          />
          <Rect
            x={width * 0.7}
            y={height * 0.1}
            width={100}
            height={100}
            fill="rgba(255, 255, 255, 0.04)"
            rotation={45}
            origin={`${width * 0.7 + 50}, ${height * 0.1 + 50}`}
          />
        </Svg>
      </Animated.View>

      {/* Layer 2 - Middle layer with medium shapes */}
      <Animated.View style={[styles.layer, layer2Style]}>
        <Svg width={width} height={height} style={styles.svg}>
          <Polygon
            points={`${width * 0.1},${height * 0.4} ${width * 0.2},${height * 0.3} ${width * 0.3},${height * 0.4} ${width * 0.2},${height * 0.5}`}
            fill="rgba(255, 255, 255, 0.06)"
          />
          <Circle
            cx={width * 0.5}
            cy={height * 0.6}
            r={60}
            fill="rgba(255, 255, 255, 0.05)"
          />
          <Circle
            cx={width * 0.9}
            cy={height * 0.3}
            r={40}
            fill="rgba(255, 255, 255, 0.07)"
          />
        </Svg>
      </Animated.View>

      {/* Layer 3 - Front layer with small shapes */}
      <Animated.View style={[styles.layer, layer3Style]}>
        <Svg width={width} height={height} style={styles.svg}>
          <Circle
            cx={width * 0.15}
            cy={height * 0.8}
            r={30}
            fill="rgba(255, 255, 255, 0.08)"
          />
          <Rect
            x={width * 0.6}
            y={height * 0.5}
            width={50}
            height={50}
            fill="rgba(255, 255, 255, 0.09)"
            rotation={30}
            origin={`${width * 0.6 + 25}, ${height * 0.5 + 25}`}
          />
          <Polygon
            points={`${width * 0.85},${height * 0.85} ${width * 0.92},${height * 0.8} ${width * 0.95},${height * 0.9}`}
            fill="rgba(255, 255, 255, 0.1)"
          />
        </Svg>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden'
  },
  gradient: {
    ...StyleSheet.absoluteFillObject
  },
  layer: {
    ...StyleSheet.absoluteFillObject
  },
  svg: {
    position: 'absolute',
    top: 0,
    left: 0
  }
});

export default ParallaxBackground;
