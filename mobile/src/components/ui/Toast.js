import React, { useEffect } from 'react';
import { Text, StyleSheet, Dimensions, Platform } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  runOnJS,
  withSequence
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, FONT_WEIGHTS, SHADOWS } from '../../utils/constants';
import { haptics } from '../../utils/haptics';

const { width } = Dimensions.get('window');
const TOAST_WIDTH = width - SPACING.lg * 2;

/**
 * Toast Component - Non-blocking notifications
 *
 * Types: success, error, warning, info
 * Position: top, bottom
 * Duration: auto-dismiss after specified time
 */
const Toast = ({
  visible,
  message,
  type = 'info',
  duration = 3000,
  position = 'top',
  onHide,
  icon
}) => {
  const insets = useSafeAreaInsets();
  const translateY = useSharedValue(position === 'top' ? -200 : 200);
  const opacity = useSharedValue(0);

  // Get icon based on type
  const getIcon = () => {
    if (icon) return icon;
    switch (type) {
      case 'success':
        return '✓';
      case 'error':
        return '✕';
      case 'warning':
        return '⚠';
      case 'info':
      default:
        return 'ℹ';
    }
  };

  // Get colors based on type
  const getColors = () => {
    switch (type) {
      case 'success':
        return {
          background: COLORS.success,
          text: COLORS.textLight
        };
      case 'error':
        return {
          background: COLORS.error,
          text: COLORS.textLight
        };
      case 'warning':
        return {
          background: COLORS.warning,
          text: COLORS.text
        };
      case 'info':
      default:
        return {
          background: COLORS.info,
          text: COLORS.textLight
        };
    }
  };

  useEffect(() => {
    if (visible) {
      // Show toast with bounce
      translateY.value = withSpring(0, {
        damping: 15,
        stiffness: 150
      });
      opacity.value = withTiming(1, { duration: 200 });

      // Haptic feedback
      if (type === 'success') {
        haptics.success();
      } else if (type === 'error') {
        haptics.error();
      } else if (type === 'warning') {
        haptics.warning();
      }

      // Auto-hide after duration
      const timer = setTimeout(() => {
        hideToast();
      }, duration);

      return () => clearTimeout(timer);
    } else {
      hideToast();
    }
  }, [visible]);

  const hideToast = () => {
    translateY.value = withSpring(
      position === 'top' ? -200 : 200,
      {
        damping: 20,
        stiffness: 150
      }
    );
    opacity.value = withTiming(0, { duration: 200 }, (finished) => {
      if (finished && onHide) {
        runOnJS(onHide)();
      }
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value
    };
  });

  const colors = getColors();
  const toastIcon = getIcon();

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          backgroundColor: colors.background,
          [position]: position === 'top' ? insets.top + SPACING.md : insets.bottom + SPACING.md
        },
        animatedStyle
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Text style={[styles.icon, { color: colors.text }]}>
        {toastIcon}
      </Text>
      <Text
        style={[styles.message, { color: colors.text }]}
        numberOfLines={2}
      >
        {message}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: SPACING.lg,
    right: SPACING.lg,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.lg,
    zIndex: 9999
  },

  icon: {
    fontSize: FONT_SIZES.xl,
    fontWeight: FONT_WEIGHTS.bold,
    marginRight: SPACING.sm,
    width: 24,
    textAlign: 'center'
  },

  message: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: FONT_WEIGHTS.medium,
    lineHeight: FONT_SIZES.md * 1.4
  }
});

export default Toast;
