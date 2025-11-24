import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
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

  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const arrowArcLength = Math.PI / 6; // Length of arrow along the arc (30 degrees)
  const arrowHeadSize = size * 0.08;
  const lineWidth = size * 0.025;

  // Helper function to create curved arrow following the circle
  const createCurvedArrowPath = (startAngle) => {
    // Arrow follows the circle tangentially (clockwise direction)
    const endAngle = startAngle + arrowArcLength;

    // Inner and outer radius for the arrow body
    const innerRadius = radius - lineWidth / 2;
    const outerRadius = radius + lineWidth / 2;

    // Start points of the arrow body (curved line)
    const startInnerX = centerX + innerRadius * Math.cos(startAngle);
    const startInnerY = centerY + innerRadius * Math.sin(startAngle);
    const startOuterX = centerX + outerRadius * Math.cos(startAngle);
    const startOuterY = centerY + outerRadius * Math.sin(startAngle);

    // End points before arrow head
    const endInnerX = centerX + innerRadius * Math.cos(endAngle);
    const endInnerY = centerY + innerRadius * Math.sin(endAngle);
    const endOuterX = centerX + outerRadius * Math.cos(endAngle);
    const endOuterY = centerY + outerRadius * Math.sin(endAngle);

    // Arrow head tip (pointing in the direction of motion)
    const tipAngle = endAngle + arrowHeadSize / radius;
    const tipX = centerX + radius * Math.cos(tipAngle);
    const tipY = centerY + radius * Math.sin(tipAngle);

    // Arrow head wings
    const wingInnerX = centerX + (radius - arrowHeadSize * 0.7) * Math.cos(endAngle);
    const wingInnerY = centerY + (radius - arrowHeadSize * 0.7) * Math.sin(endAngle);
    const wingOuterX = centerX + (radius + arrowHeadSize * 0.7) * Math.cos(endAngle);
    const wingOuterY = centerY + (radius + arrowHeadSize * 0.7) * Math.sin(endAngle);

    // Use arc commands to create smooth curves
    const largeArcFlag = 0; // 0 for arcs < 180 degrees
    const sweepFlag = 1; // 1 for clockwise

    return `
      M ${startOuterX} ${startOuterY}
      A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} ${sweepFlag} ${endOuterX} ${endOuterY}
      L ${wingOuterX} ${wingOuterY}
      L ${tipX} ${tipY}
      L ${wingInnerX} ${wingInnerY}
      L ${endInnerX} ${endInnerY}
      A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${startInnerX} ${startInnerY}
      Z
    `;
  };

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

      {/* Rotating curved arrows */}
      <AnimatedView style={[styles.arrowsContainer, animatedStyle]}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.arrowSvg}>
          {/* Arrow 1 - starting from top */}
          <Path
            d={createCurvedArrowPath(-Math.PI / 2)}
            fill={colors.primary}
          />

          {/* Arrow 2 - starting from 120 degrees */}
          <Path
            d={createCurvedArrowPath(Math.PI / 6)}
            fill={colors.secondary}
          />

          {/* Arrow 3 - starting from 240 degrees */}
          <Path
            d={createCurvedArrowPath(7 * Math.PI / 6)}
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
