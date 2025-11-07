import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../utils/constants';

const ChallengeCard = ({ challenge, userProgress }) => {
  const progress = userProgress?.progress || 0;
  const target = challenge.target_value;
  const percentage = Math.min((progress / target) * 100, 100);
  const isCompleted = userProgress?.completed || false;

  return (
    <View style={[
      styles.card,
      isCompleted && styles.cardCompleted
    ]}>
      <View style={styles.header}>
        <Text style={styles.icon}>{challenge.icon_url}</Text>
        <View style={styles.headerContent}>
          <Text style={styles.title}>{challenge.name}</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </View>
        <View style={styles.bonusContainer}>
          <Text style={styles.bonusPoints}>+{challenge.bonus_points}</Text>
          <Text style={styles.bonusLabel}>pts</Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBarContainer}>
        <View 
          style={[
            styles.progressBarFill,
            { 
              width: `${percentage}%`,
              backgroundColor: isCompleted ? COLORS.success : COLORS.primary
            }
          ]}
        />
      </View>

      <View style={styles.footer}>
        <Text style={styles.progressText}>
          {progress} / {target} {challenge.challenge_type === 'STREAK' ? 'días' : ''}
        </Text>
        {isCompleted && (
          <View style={styles.completedBadge}>
            <Text style={styles.completedBadgeText}>✓ Completado</Text>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  cardCompleted: {
    borderWidth: 2,
    borderColor: COLORS.success
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  icon: {
    fontSize: 32,
    marginRight: SPACING.sm
  },
  headerContent: {
    flex: 1
  },
  title: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xxs
  },
  description: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.4
  },
  bonusContainer: {
    backgroundColor: COLORS.primaryLight + '20',
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    alignItems: 'center',
    minWidth: 50
  },
  bonusPoints: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.primary
  },
  bonusLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.primary,
    fontWeight: '600'
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden',
    marginBottom: SPACING.sm
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  progressText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary
  },
  completedBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md
  },
  completedBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight
  }
});

export default ChallengeCard;
