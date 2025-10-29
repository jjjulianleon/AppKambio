import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming
} from 'react-native-reanimated';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../utils/constants';
import { formatCurrency, formatPercentage } from '../utils/helpers';

const ProgressBar = ({ current, target, showLabels = true, height = 24 }) => {
  const progress = (current / target) * 100;
  const clampedProgress = Math.min(progress, 100);

  const progressWidth = useSharedValue(0);

  useEffect(() => {
    progressWidth.value = withSpring(clampedProgress, {
      damping: 15,
      stiffness: 100
    });
  }, [clampedProgress]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`
    };
  });

  const isCompleted = clampedProgress >= 100;

  return (
    <View style={styles.container}>
      {showLabels && (
        <View style={styles.labelContainer}>
          <Text style={styles.labelCurrent}>{formatCurrency(current)}</Text>
          <Text style={styles.labelTarget}>de {formatCurrency(target)}</Text>
        </View>
      )}

      <View style={[styles.progressBarContainer, { height }]}>
        <Animated.View
          style={[
            styles.progressBarFill,
            animatedStyle,
            { backgroundColor: isCompleted ? COLORS.success : COLORS.primary }
          ]}
        />
        <View style={styles.progressTextContainer}>
          <Text style={styles.progressText}>
            {formatPercentage(clampedProgress)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%'
  },
  labelContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm
  },
  labelCurrent: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text
  },
  labelTarget: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  progressBarContainer: {
    width: '100%',
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    position: 'relative'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round
  },
  progressTextContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: 'bold',
    color: COLORS.text
  }
});

export default ProgressBar;
