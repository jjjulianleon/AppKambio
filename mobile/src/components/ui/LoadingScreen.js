import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
  withSpring,
  Easing
} from 'react-native-reanimated';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS } from '../../utils/constants';

/**
 * LoadingScreen Component - Consistent loading screen across the app
 *
 * Features:
 * - Animated logo/icon
 * - Customizable message
 * - Breathing animation
 * - Clean and professional
 */
const LoadingScreen = ({
  message = 'Cargando...',
  icon = '⏳',
  showIcon = true,
  fullScreen = true
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const rotate = useSharedValue(0);

  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 300 });

    // Breathing scale animation
    scale.value = withRepeat(
      withSequence(
        withSpring(1.1, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      false
    );

    // Rotation animation for hourglass
    if (icon === '⏳' || icon === '🔄') {
      rotate.value = withRepeat(
        withTiming(360, {
          duration: 2000,
          easing: Easing.linear
        }),
        -1,
        false
      );
    }
  }, []);

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotate.value}deg` }
      ],
      opacity: opacity.value
    };
  });

  const textAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    };
  });

  const Container = fullScreen ? SafeAreaView : View;

  return (
    <Container style={styles.container}>
      <View style={styles.content}>
        {showIcon && (
          <Animated.Text style={[styles.icon, iconAnimatedStyle]}>
            {icon}
          </Animated.Text>
        )}

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
          style={styles.spinner}
        />

        <Animated.Text
          style={[styles.message, textAnimatedStyle]}
          accessibilityLiveRegion="polite"
          accessibilityLabel={message}
        >
          {message}
        </Animated.Text>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center'
  },

  content: {
    alignItems: 'center',
    justifyContent: 'center'
  },

  icon: {
    fontSize: 64,
    marginBottom: SPACING.lg
  },

  spinner: {
    marginBottom: SPACING.md
  },

  message: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
});

export default LoadingScreen;
