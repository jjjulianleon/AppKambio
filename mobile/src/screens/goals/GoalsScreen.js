import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getAllGoals, completeGoal } from '../../services/goalService';
import { formatCurrency } from '../../utils/helpers';
import { haptics } from '../../utils/haptics';
import { useToast } from '../../contexts/ToastContext';
import GoalCard from '../../components/GoalCard';

const GoalsScreen = ({ navigation }) => {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadGoals();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadGoals();
    }, [])
  );

  const loadGoals = async () => {
    try {
      const goalsResponse = await getAllGoals();
      setGoals(goalsResponse.goals || []);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadGoals();
  };

  const toggleCompleted = () => {
    const willExpand = !completedExpanded;
    haptics.selection();
    setCompletedExpanded(willExpand);

    Animated.timing(rotateAnim, {
      toValue: willExpand ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const handleCompleteGoal = (goal) => {
    haptics.warning();
    Alert.alert(
      'Completar Meta',
      `¿Confirmas que quieres completar "${goal.name}"?\n\nSe restarán ${formatCurrency(goal.target_amount)} de tu ahorro general.`,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => haptics.light() },
        {
          text: 'Completar',
          style: 'default',
          onPress: async () => {
            try {
              await haptics.success();
              await completeGoal(goal.id);
              toast.success(`¡Meta "${goal.name}" completada!`);
              // Small delay to ensure backend transaction is fully committed
              setTimeout(() => {
                loadGoals();
              }, 500);
            } catch (error) {
              await haptics.error();
              toast.error(error.message || 'No se pudo completar la meta');
            }
          }
        }
      ]
    );
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const arrowRotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg']
  });

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>📊 Mis Finanzas</Text>
            <Text style={styles.subtitle}>
              Metas • Ahorros • Gastos
            </Text>
          </View>

          {/* Coming Soon Tabs */}
          <View style={styles.comingSoonBanner}>
            <Text style={styles.comingSoonText}>
              📌 Próximamente: Historial de Ahorros y Gastos Hormiga
            </Text>
          </View>

          {/* Create Goal Button - Always Visible */}
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              haptics.medium();
              navigation.navigate(ROUTES.CREATE_GOAL);
            }}
            activeOpacity={0.8}
          >
            <View style={styles.createButtonContent}>
              <View style={styles.createIconContainer}>
                <Text style={styles.createIcon}>+</Text>
              </View>
              <View style={styles.createTextContainer}>
                <Text style={styles.createButtonTitle}>Crear Nueva Meta</Text>
                <Text style={styles.createButtonSubtitle}>
                  {activeGoals.length === 0
                    ? '¡Empieza tu camino de ahorro!'
                    : 'Agrega otro objetivo a tu lista'}
                </Text>
              </View>
            </View>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          {/* Active Goals Section */}
          {activeGoals.length > 0 ? (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Metas Activas</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{activeGoals.length}</Text>
                </View>
              </View>
              {activeGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goalId: goal.id })}
                  onComplete={handleCompleteGoal}
                />
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyEmoji}>🎯</Text>
              </View>
              <Text style={styles.emptyTitle}>¡Crea tu primera meta!</Text>
              <Text style={styles.emptyText}>
                Define qué quieres lograr y empieza{'\n'}tu camino de ahorro
              </Text>
            </View>
          )}

          {/* Completed Goals Section */}
          {completedGoals.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={toggleCompleted}
                activeOpacity={0.7}
              >
                <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                  <Text style={styles.sectionTitle}>Metas Completadas</Text>
                  <View style={[styles.badge, styles.completedBadge]}>
                    <Text style={styles.badgeText}>{completedGoals.length}</Text>
                  </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                  <Text style={styles.expandIcon}>▼</Text>
                </Animated.View>
              </TouchableOpacity>

              {completedExpanded && (
                <Animated.View
                  style={{
                    opacity: fadeAnim
                  }}
                >
                  {completedGoals.map(goal => (
                    <GoalCard
                      key={goal.id}
                      goal={goal}
                      onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goalId: goal.id })}
                    />
                  ))}
                </Animated.View>
              )}
            </View>
          )}

          {/* Stats Summary */}
          {goals.length > 0 && (
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>📊 Resumen</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{activeGoals.length}</Text>
                  <Text style={styles.statLabel}>Activas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={[styles.statValue, styles.completedStatValue]}>
                    {completedGoals.length}
                  </Text>
                  <Text style={styles.statLabel}>Completadas</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{goals.length}</Text>
                  <Text style={styles.statLabel}>Total</Text>
                </View>
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.5
  },
  comingSoonBanner: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary
  },
  comingSoonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600',
    textAlign: 'center'
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md
  },
  createButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  createIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  createIcon: {
    fontSize: 28,
    color: COLORS.textLight,
    fontWeight: 'bold',
    marginTop: -2
  },
  createTextContainer: {
    flex: 1
  },
  createButtonTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2
  },
  createButtonSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.9
  },
  arrowIcon: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textLight,
    fontWeight: '700',
    marginLeft: SPACING.sm
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  badge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.round,
    marginLeft: SPACING.sm,
    minWidth: 24,
    alignItems: 'center'
  },
  completedBadge: {
    backgroundColor: COLORS.success
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md
  },
  expandIcon: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '700'
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl * 2,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  emptyEmoji: {
    fontSize: 50
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5
  },
  statsCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md,
    textAlign: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center'
  },
  statItem: {
    alignItems: 'center',
    flex: 1
  },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2
  },
  completedStatValue: {
    color: COLORS.success
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border
  }
});

export default GoalsScreen;
