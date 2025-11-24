import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { haptics } from '../../utils/haptics';

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Card Component - Reusable card container with variants
 *
 * Variants:
 * - default: Standard card
 * - elevated: Card with more shadow
 * - outlined: Card with border, no shadow
 * - filled: Card with colored background
 *
 * Padding: none, small, medium, large
 */
const Card = ({
  children,
  variant = 'default',
  padding = 'medium',
  onPress,
  pressable = false,
  style,
  ...rest
}) => {
  const scale = useSharedValue(1);

  // Press animation
  const handlePressIn = () => {
    if (pressable || onPress) {
      scale.value = withSpring(0.98, {
        damping: 15,
        stiffness: 400
      });
      haptics.light();
    }
  };

  const handlePressOut = () => {
    if (pressable || onPress) {
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 400
      });
    }
  };

  // Animated style
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    };
  });

  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return [styles.card, styles.cardElevated];
      case 'outlined':
        return [styles.card, styles.cardOutlined];
      case 'filled':
        return [styles.card, styles.cardFilled];
      case 'primary':
        return [styles.card, styles.cardPrimary];
      default:
        return [styles.card, styles.cardDefault];
    }
  };

  // Get padding style
  const getPaddingStyle = () => {
    switch (padding) {
      case 'none':
        return styles.paddingNone;
      case 'small':
        return styles.paddingSmall;
      case 'medium':
        return styles.paddingMedium;
      case 'large':
        return styles.paddingLarge;
      default:
        return styles.paddingMedium;
    }
  };

  const variantStyle = getVariantStyle();
  const paddingStyle = getPaddingStyle();

  // If pressable or has onPress, use TouchableOpacity
  if (pressable || onPress) {
    return (
      <AnimatedTouchable
        style={[variantStyle, paddingStyle, animatedStyle, style]}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
        accessible={true}
        accessibilityRole="button"
        {...rest}
      >
        {children}
      </AnimatedTouchable>
    );
  }

  // Otherwise, use regular View
  return (
    <AnimatedView
      style={[variantStyle, paddingStyle, style]}
      {...rest}
    >
      {children}
    </AnimatedView>
  );
};

const styles = StyleSheet.create({
  // Base card
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden'
  },

  // Variants
  cardDefault: {
    ...SHADOWS.sm
  },

  cardElevated: {
    ...SHADOWS.lg
  },

  cardOutlined: {
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.none
  },

  cardFilled: {
    backgroundColor: COLORS.backgroundDark,
    ...SHADOWS.none
  },

  cardPrimary: {
    backgroundColor: COLORS.primaryAlpha10,
    borderWidth: 1,
    borderColor: COLORS.primaryAlpha20,
    ...SHADOWS.sm
  },

  // Padding variants
  paddingNone: {
    padding: 0
  },

  paddingSmall: {
    padding: SPACING.sm
  },

  paddingMedium: {
    padding: SPACING.md
  },

  paddingLarge: {
    padding: SPACING.lg
  }
});

export default Card;
