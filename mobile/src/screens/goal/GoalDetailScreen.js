import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getGoalById, deleteGoal } from '../../services/goalService';
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

  useEffect(() => {
    loadGoal();
  }, []);

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

  const kambios = goal.kambios || [];
  const isCompleted = goal.status === 'completed';

  return (
    <ScrollView
      style={styles.container}
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
          Kambios realizados ({kambios.length})
        </Text>
        {kambios.length === 0 ? (
          <EmptyState
            emoji="💰"
            title="Sin Kambios aún"
            description="Registra tu primer Kambio para comenzar a ahorrar"
            actionLabel={!isCompleted ? "Registrar Kambio" : undefined}
            onActionPress={!isCompleted ? () => {
              haptics.medium();
              navigation.navigate(ROUTES.KAMBIO, { goal });
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
            navigation.navigate(ROUTES.KAMBIO, { goal });
          }}
          variant="primary"
          size="large"
          fullWidth
          hapticFeedback="medium"
          style={styles.kambioButton}
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
    marginHorizontal: SPACING.md,
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
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md
  },
  deleteButton: {
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.md,
    marginBottom: SPACING.xxxl
  }
});

export default GoalDetailScreen;
