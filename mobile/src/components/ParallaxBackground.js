import React from 'react';
import { StyleSheet, Dimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Rect } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const ParallaxBackground = ({
  scrollOffset,
  gradientStart = '#6B4CE6',
  gradientEnd = '#00D9FF'
}) => {
  return (
    <View style={styles.container}>
      {/* Base gradient background */}
      <LinearGradient
        colors={[gradientStart, gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      />

      {/* Static decorative shapes */}
      <View style={styles.layer}>
        <Svg width={width} height={height} style={styles.svg}>
          {/* Back layer shapes */}
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

          {/* Middle layer shapes */}
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

          {/* Front layer shapes */}
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
        </Svg>
      </View>
    </View>
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
