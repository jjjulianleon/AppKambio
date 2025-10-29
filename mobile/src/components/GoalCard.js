import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../utils/constants';
import { formatCurrency, calculateProgress } from '../utils/helpers';
import ProgressBar from './ProgressBar';

const GoalCard = ({ goal, onPress }) => {
  const progress = calculateProgress(goal.current_amount, goal.target_amount);
  const isCompleted = goal.status === 'completed';

  return (
    <TouchableOpacity
      style={[styles.card, isCompleted && styles.cardCompleted]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      {goal.image_url && (
        <Image
          source={{ uri: goal.image_url }}
          style={styles.image}
          resizeMode="cover"
        />
      )}

      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.name} numberOfLines={1}>
            {goal.name}
          </Text>
          {isCompleted && (
            <Text style={styles.completedBadge}>✓ Completada</Text>
          )}
        </View>

        <ProgressBar
          current={parseFloat(goal.current_amount)}
          target={parseFloat(goal.target_amount)}
          showLabels={true}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {goal.kambios?.length || 0} Kambios realizados
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  cardCompleted: {
    borderWidth: 2,
    borderColor: COLORS.success
  },
  image: {
    width: '100%',
    height: 150
  },
  content: {
    padding: SPACING.md
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  name: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    flex: 1
  },
  completedBadge: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: 'bold',
    backgroundColor: COLORS.success + '20',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm
  },
  footer: {
    marginTop: SPACING.sm
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  }
});

export default GoalCard;
