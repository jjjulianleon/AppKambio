import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getGoalById, deleteGoal, completeGoal } from '../../services/goalService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import ProgressBar from '../../components/ProgressBar';
import { Button, EmptyState, LoadingScreen, Card } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { haptics } from '../../utils/haptics';

const GoalDetailScreen = ({ navigation, route }) => {
  const toast = useToast();
  const { goalId } = route.params;
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadGoal();
    }, [])
  );

  const loadGoal = async () => {
    try {
      await haptics.light();
      const response = await getGoalById(goalId);
      setGoal(response.goal);
    } catch (error) {
      await haptics.error();
      toast.error('No se pudo cargar la meta');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCompleteGoal = () => {
    haptics.warning();
    Alert.alert(
      'Completar Meta',
      `¿Confirmas que quieres completar "${goal.name}"?\n\nSe restarán ${formatCurrency(goal.target_amount)} de tu ahorro general.`,
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => haptics.light()
        },
        {
          text: 'Completar',
          style: 'default',
          onPress: async () => {
            try {
              await haptics.success();
              await completeGoal(goalId);
              toast.success(`¡Meta "${goal.name}" completada!`);
              navigation.goBack();
            } catch (error) {
              await haptics.error();
              toast.error(error.message || 'No se pudo completar la meta');
            }
          }
        }
      ]
    );
  };

  const handleDelete = () => {
    haptics.warning();
    Alert.alert(
      'Eliminar meta',
      '¿Estás seguro de que quieres eliminar esta meta?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
          onPress: () => haptics.light()
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await haptics.medium();
              await deleteGoal(goalId);
              await haptics.success();
              toast.success('Meta eliminada exitosamente');
              setTimeout(() => {
                navigation.goBack();
              }, 1000);
            } catch (error) {
              await haptics.error();
              toast.error('No se pudo eliminar la meta');
            }
          }
        }
      ]
    );
  };

  if (loading || !goal) {
    return (
      <LoadingScreen
        message="Cargando meta..."
        icon="🎯"
        fullScreen
      />
    );
  }

  // Use goal-specific kambios if available, otherwise show recent general activity
  const kambios = (goal.kambios && goal.kambios.length > 0)
    ? goal.kambios
    : (goal.recent_kambios || []);

  const isGeneralActivity = !goal.kambios || goal.kambios.length === 0;
  const isCompleted = goal.status === 'completed';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => {
            haptics.light();
            setRefreshing(true);
            loadGoal();
          }}
          tintColor={COLORS.primary}
        />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>{goal.name}</Text>
        {isCompleted && (
          <View style={styles.completedBadgeContainer}>
            <Text style={styles.completedBadge}>✓ Completada</Text>
          </View>
        )}
      </View>

      <Card variant="elevated" padding="large" style={styles.progressCard}>
        <ProgressBar
          current={parseFloat(goal.current_amount)}
          target={parseFloat(goal.target_amount)}
          showLabels={true}
        />
      </Card>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {isGeneralActivity ? 'Actividad Reciente (General)' : `Kambios de esta meta (${kambios.length})`}
        </Text>
        {kambios.length === 0 ? (
          <EmptyState
            emoji="💰"
            title="Sin Kambios aún"
            description="Registra tu primer Kambio para comenzar a ahorrar"
            actionLabel={!isCompleted ? "Registrar Kambio" : undefined}
            onActionPress={!isCompleted ? () => {
              haptics.medium();
              navigation.navigate(ROUTES.KAMBIO);
            } : undefined}
          />
        ) : (
          kambios.map(kambio => (
            <Card
              key={kambio.id}
              variant="outlined"
              padding="medium"
              style={styles.kambioCard}
            >
              <Text style={styles.kambioAmount}>
                {formatCurrency(kambio.amount)}
              </Text>
              <Text style={styles.kambioDate}>
                {formatDate(kambio.created_at)}
              </Text>
              {kambio.description && (
                <Text style={styles.kambioDescription}>
                  {kambio.description}
                </Text>
              )}
            </Card>
          ))
        )}
      </View>

      {!isCompleted && kambios.length > 0 && (
        <Button
          title="💪 Registrar Kambio"
          onPress={() => {
            haptics.medium();
            navigation.navigate(ROUTES.KAMBIO);
          }}
          variant="primary"
          size="large"
          fullWidth
          hapticFeedback="medium"
          style={styles.kambioButton}
        />
      )}

      {/* Complete Goal Button - NEW GENERAL SAVINGS SYSTEM */}
      {!isCompleted && goal?.can_be_completed && (
        <Button
          title="✅ Completar Meta"
          onPress={handleCompleteGoal}
          variant="success"
          size="large"
          fullWidth
          hapticFeedback="medium"
          style={styles.completeButton}
        />
      )}

      <Button
        title="Eliminar meta"
        onPress={handleDelete}
        variant="danger"
        size="large"
        fullWidth
        hapticFeedback="warning"
        style={styles.deleteButton}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: SPACING.xxxl,
    paddingHorizontal: SPACING.md
  },
  header: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    ...SHADOWS.sm
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5
  },
  completedBadgeContainer: {
    marginTop: SPACING.md,
    alignSelf: 'flex-start',
    backgroundColor: COLORS.successAlpha20,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round
  },
  completedBadge: {
    fontSize: FONT_SIZES.md,
    color: COLORS.success,
    fontWeight: '700'
  },
  progressCard: {
    marginTop: SPACING.md
  },
  section: {
    padding: SPACING.xl,
    backgroundColor: COLORS.surface,
    marginTop: SPACING.md,
    ...SHADOWS.sm
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  kambioCard: {
    marginBottom: SPACING.sm
  },
  kambioAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  kambioDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xxs
  },
  kambioDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
    fontStyle: 'italic'
  },
  kambioButton: {
    marginTop: SPACING.md
  },
  completeButton: {
    marginTop: SPACING.md
  },
  deleteButton: {
    marginTop: SPACING.md
  }
});

export default GoalDetailScreen;
