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

// Use confetti colors from centralized constants
const CONFETTI_COLORS = [
  COLORS.confetti.gold,
  COLORS.confetti.pink,
  COLORS.confetti.green,
  COLORS.confetti.cyan,
  COLORS.confetti.coral,
  COLORS.confetti.orange
];

const Confetti = ({ delay = 0, startX = 0, startY = 0, screenHeight = 800 }) => {
  const translateY = useSharedValue(0);
  const translateX = useSharedValue(0);
  const rotate = useSharedValue(0);
  const opacity = useSharedValue(1);

  const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)];
  const randomRotation = Math.random() * 360;
  const randomXMovement = (Math.random() - 0.5) * 100;
  const fallDistance = screenHeight * 1.2;

  useEffect(() => {
    translateY.value = withDelay(
      delay,
      withTiming(fallDistance, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.linear
      })
    );

    translateX.value = withDelay(
      delay,
      withTiming(randomXMovement, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.inOut(Easing.ease)
      })
    );

    rotate.value = withDelay(
      delay,
      withTiming(randomRotation + 720, {
        duration: 2000 + Math.random() * 1000,
        easing: Easing.linear
      })
    );

    opacity.value = withDelay(
      delay + 1500,
      withTiming(0, {
        duration: 500,
        easing: Easing.out(Easing.quad)
      })
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotate.value}deg` }
      ],
      opacity: opacity.value
    };
  });

  return (
    <Animated.View
      style={[
        styles.confetti,
        { left: startX, top: startY, backgroundColor: color },
        animatedStyle
      ]}
    />
  );
};

const styles = StyleSheet.create({
  confetti: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 2
  }
});

export default Confetti;
