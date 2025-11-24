import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import Button from './Button';
import { COLORS, SPACING, FONT_SIZES, FONT_WEIGHTS, BORDER_RADIUS } from '../../utils/constants';

/**
 * EmptyState Component - Consistent empty state across the app
 *
 * Features:
 * - Animated emoji/icon
 * - Title and description
 * - Optional action button
 * - Friendly and encouraging
 */
const EmptyState = ({
  emoji = '🎯',
  title = 'Nada por aquí',
  description = 'Comienza agregando algo nuevo',
  actionLabel,
  onActionPress,
  style
}) => {
  const scale = useSharedValue(1);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    // Fade in
    opacity.value = withTiming(1, { duration: 500 });

    // Floating animation for emoji
    translateY.value = withRepeat(
      withSequence(
        withSpring(-10, { damping: 10, stiffness: 100 }),
        withSpring(0, { damping: 10, stiffness: 100 })
      ),
      -1,
      false
    );

    // Breathing scale
    scale.value = withRepeat(
      withSequence(
        withSpring(1.05, { damping: 10 }),
        withSpring(1, { damping: 10 })
      ),
      -1,
      false
    );
  }, []);

  const emojiAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });

  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    };
  });

  return (
    <Animated.View style={[styles.container, contentAnimatedStyle, style]}>
      <View style={styles.iconContainer}>
        <Animated.Text style={[styles.emoji, emojiAnimatedStyle]}>
          {emoji}
        </Animated.Text>
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.description}>{description}</Text>

      {actionLabel && onActionPress && (
        <Button
          title={actionLabel}
          onPress={onActionPress}
          variant="primary"
          size="medium"
          style={styles.actionButton}
        />
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl
  },

  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryAlpha10,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl
  },

  emoji: {
    fontSize: 64
  },

  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: FONT_WEIGHTS.bold,
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.sm
  },

  description: {
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.regular,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5,
    marginBottom: SPACING.xl
  },

  actionButton: {
    minWidth: 200
  }
});

export default EmptyState;
