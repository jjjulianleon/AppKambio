import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withTiming,
  interpolate
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS, FONT_WEIGHTS } from '../../utils/constants';
import { haptics } from '../../utils/haptics';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

/**
 * Button Component - Reusable button with animations and haptic feedback
 *
 * Variants:
 * - primary: Main actions (solid background)
 * - secondary: Secondary actions (outlined)
 * - tertiary: Subtle actions (text only)
 * - danger: Destructive actions (red)
 * - ghost: Minimal style
 *
 * Sizes: small, medium, large
 */
const Button = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  variant = 'primary',
  size = 'large',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  style,
  textStyle,
  hapticFeedback = 'light', // 'light', 'medium', 'heavy', 'none'
  ...rest
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Press animation
  const handlePressIn = () => {
    scale.value = withSpring(0.95, {
      damping: 15,
      stiffness: 400
    });

    // Haptic feedback
    if (hapticFeedback !== 'none' && !disabled && !loading) {
      if (hapticFeedback === 'light') haptics.light();
      else if (hapticFeedback === 'medium') haptics.medium();
      else if (hapticFeedback === 'heavy') haptics.heavy();
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 400
    });
  };

  const handlePress = async () => {
    if (onPress && !disabled && !loading) {
      // Success pulse animation
      scale.value = withSequence(
        withSpring(0.95, { damping: 15 }),
        withSpring(1.02, { damping: 15 }),
        withSpring(1, { damping: 15 })
      );

      onPress();
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.5 : opacity.value
    };
  });

  // Get variant styles
  const getVariantStyle = () => {
    switch (variant) {
      case 'primary':
        return {
          container: styles.primaryContainer,
          text: styles.primaryText
        };
      case 'secondary':
        return {
          container: styles.secondaryContainer,
          text: styles.secondaryText
        };
      case 'tertiary':
        return {
          container: styles.tertiaryContainer,
          text: styles.tertiaryText
        };
      case 'danger':
        return {
          container: styles.dangerContainer,
          text: styles.dangerText
        };
      case 'ghost':
        return {
          container: styles.ghostContainer,
          text: styles.ghostText
        };
      default:
        return {
          container: styles.primaryContainer,
          text: styles.primaryText
        };
    }
  };

  // Get size styles
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          container: styles.smallContainer,
          text: styles.smallText
        };
      case 'medium':
        return {
          container: styles.mediumContainer,
          text: styles.mediumText
        };
      case 'large':
        return {
          container: styles.largeContainer,
          text: styles.largeText
        };
      default:
        return {
          container: styles.largeContainer,
          text: styles.largeText
        };
    }
  };

  const variantStyles = getVariantStyle();
  const sizeStyles = getSizeStyle();

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        variantStyles.container,
        sizeStyles.container,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading }}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === 'primary' || variant === 'danger'
              ? COLORS.textLight
              : COLORS.primary
          }
          size="small"
        />
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <Text style={[styles.icon, sizeStyles.text]}>{icon}</Text>
          )}
          <Text
            style={[
              styles.text,
              variantStyles.text,
              sizeStyles.text,
              icon && iconPosition === 'left' && styles.textWithIconLeft,
              icon && iconPosition === 'right' && styles.textWithIconRight,
              textStyle
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Text style={[styles.icon, sizeStyles.text]}>{icon}</Text>
          )}
        </>
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden'
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    opacity: 0.5
  },

  // Variant styles
  primaryContainer: {
    backgroundColor: COLORS.primary,
    ...SHADOWS.colored
  },
  primaryText: {
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.bold
  },

  secondaryContainer: {
    backgroundColor: COLORS.backgroundLight,
    borderWidth: 2,
    borderColor: COLORS.primary,
    ...SHADOWS.sm
  },
  secondaryText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold
  },

  tertiaryContainer: {
    backgroundColor: COLORS.primaryAlpha10
  },
  tertiaryText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.semibold
  },

  dangerContainer: {
    backgroundColor: COLORS.error,
    ...SHADOWS.sm
  },
  dangerText: {
    color: COLORS.textLight,
    fontWeight: FONT_WEIGHTS.bold
  },

  ghostContainer: {
    backgroundColor: 'transparent'
  },
  ghostText: {
    color: COLORS.primary,
    fontWeight: FONT_WEIGHTS.medium
  },

  // Size styles
  smallContainer: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    minHeight: 32
  },
  smallText: {
    fontSize: FONT_SIZES.sm
  },

  mediumContainer: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    minHeight: 40
  },
  mediumText: {
    fontSize: FONT_SIZES.md
  },

  largeContainer: {
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    minHeight: 48
  },
  largeText: {
    fontSize: FONT_SIZES.lg
  },

  // Text styles
  text: {
    textAlign: 'center'
  },
  textWithIconLeft: {
    marginLeft: SPACING.xs
  },
  textWithIconRight: {
    marginRight: SPACING.xs
  },

  // Icon styles
  icon: {
    fontSize: FONT_SIZES.lg
  }
});

export default Button;
