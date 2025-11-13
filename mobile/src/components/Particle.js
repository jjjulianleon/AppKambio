import React, { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  Easing
} from 'react-native-reanimated';
import { COLORS } from '../utils/constants';

const Particle = ({ delay = 0, startX = 0, startY = 0, endY = -100, duration = 800 }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    // Slight random horizontal movement
    const randomX = (Math.random() - 0.5) * 30;

    translateY.value = withDelay(
      delay,
      withTiming(endY, {
        duration,
        easing: Easing.out(Easing.quad)
      })
    );

    translateX.value = withDelay(
      delay,
      withTiming(randomX, {
        duration,
        easing: Easing.out(Easing.quad)
      })
    );

    scale.value = withDelay(
      delay,
      withTiming(0.3, {
        duration,
        easing: Easing.out(Easing.quad)
      })
    );

    opacity.value = withDelay(
      delay,
      withTiming(0, {
        duration,
        easing: Easing.out(Easing.quad)
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value
    };
  });

  return (
    <Animated.View
      style={[
        styles.particle,
        { left: startX, top: startY },
        animatedStyle
      ]}
    />
  );
};

const styles = StyleSheet.create({
  particle: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.confetti.orange // Use centralized color
  }
});

export default Particle;
