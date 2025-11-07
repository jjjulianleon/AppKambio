import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../utils/constants';
import { formatCurrency } from '../utils/helpers';

const { width } = Dimensions.get('window');
const cardWidth = (width - SPACING.lg * 2 - SPACING.md * 2) / 3;

const RewardCard = ({ reward, unlocked, onPress }) => {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        !unlocked && styles.cardLocked
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!unlocked}
    >
      <View style={[
        styles.iconContainer,
        unlocked ? styles.iconContainerUnlocked : styles.iconContainerLocked
      ]}>
        <Text style={styles.icon}>
          {unlocked ? reward.icon_url : '🔒'}
        </Text>
      </View>
      
      <Text style={styles.level}>
        Nivel {reward.level}
      </Text>
      
      <Text style={[
        styles.amount,
        !unlocked && styles.amountLocked
      ]}>
        {formatCurrency(reward.min_savings)}
      </Text>
      
      {unlocked && (
        <View style={styles.unlockedBadge}>
          <Text style={styles.unlockedBadgeText}>✓</Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: cardWidth,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    margin: SPACING.xs,
    alignItems: 'center',
    ...SHADOWS.sm,
    position: 'relative'
  },
  cardLocked: {
    opacity: 0.6
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs
  },
  iconContainerUnlocked: {
    backgroundColor: COLORS.primaryLight + '30'
  },
  iconContainerLocked: {
    backgroundColor: COLORS.border
  },
  icon: {
    fontSize: 28
  },
  level: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: SPACING.xxs
  },
  amount: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.text
  },
  amountLocked: {
    color: COLORS.textSecondary
  },
  unlockedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.success,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm
  },
  unlockedBadgeText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.xs,
    fontWeight: '700'
  }
});

export default RewardCard;
