import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getAllGoals, getKambiosWithMonthlySummary } from '../../services/goalService';
import { getStoredUser } from '../../services/authService';
import * as savingsPoolService from '../../services/savingsPoolService';
import { getGreeting, formatCurrency } from '../../utils/helpers';
import { haptics } from '../../utils/haptics';
import { useToast } from '../../contexts/ToastContext';
import { Button, EmptyState } from '../../components/ui';
import GoalCard from '../../components/GoalCard';
import KambioButton from '../../components/KambioButton';

const DashboardScreen = ({ navigation }) => {
  const toast = useToast();
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kambioLoading, setKambioLoading] = useState(false);
  const [completedExpanded, setCompletedExpanded] = useState(false);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [totalSaved, setTotalSaved] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const heightAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      const userData = await getStoredUser();
      setUser(userData);

      const goalsResponse = await getAllGoals();
      setGoals(goalsResponse.goals || []);

      // Cargar total ahorrado del mes
      try {
        const monthlySummaryData = await getKambiosWithMonthlySummary();
        setTotalSaved(monthlySummaryData.currentMonthTotal);
        console.log('Current month total:', monthlySummaryData.currentMonthTotal);
      } catch (kambioError) {
        console.log('Kambios data not available:', kambioError);
        setTotalSaved(0);
      }

      // Cargar solicitudes completadas recientes del pozo
      try {
        const myRequests = await savingsPoolService.getMyRequests();
        if (myRequests && myRequests.length > 0) {
          // Filtrar solo las completadas en los últimos 7 días
          const recentCompleted = myRequests.filter(req => {
            if (req.status === 'completed') {
              const completedDate = new Date(req.completedAt);
              const daysDiff = (Date.now() - completedDate.getTime()) / (1000 * 60 * 60 * 24);
              return daysDiff <= 7;
            }
            return false;
          });
          setCompletedRequests(recentCompleted);
        }
      } catch (poolError) {
        // No mostrar error si falla la carga del pozo
        console.log('Pool data not available:', poolError);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const handleKambio = async () => {
    if (activeGoals.length === 0) {
      Alert.alert('Sin meta activa', 'Por favor crea una meta primero', [
        { text: 'Crear meta', onPress: () => navigation.navigate(ROUTES.CREATE_GOAL) },
        { text: 'Cancelar', style: 'cancel' }
      ]);
      return;
    }

    // Si hay más de una meta activa, mostrar selector
    if (activeGoals.length > 1) {
      const buttons = activeGoals.map(goal => {
        const progress = Math.round((goal.current_amount / goal.target_amount) * 100) || 0;
        return {
          text: `${goal.name || 'Meta sin nombre'} (${progress}%)`,
          onPress: () => navigation.navigate(ROUTES.KAMBIO, { goal })
        };
      });
      buttons.push({ text: 'Cancelar', style: 'cancel' });

      Alert.alert(
        'Selecciona una meta',
        '¿A qué meta quieres dirigir este ahorro?',
        buttons
      );
    } else {
      // Si solo hay una meta, ir directo
      navigation.navigate(ROUTES.KAMBIO, { goal: activeGoals[0] });
    }
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  const toggleCompleted = () => {
    const willExpand = !completedExpanded;
    const toValue = willExpand ? 1 : 0;

    // Haptic feedback
    haptics.selection();

    setCompletedExpanded(willExpand);

    Animated.parallel([
      Animated.timing(rotateAnim, {
        toValue,
        duration: 300,
        useNativeDriver: true
      }),
      Animated.timing(heightAnim, {
        toValue,
        duration: 300,
        useNativeDriver: false
      })
    ]).start();
  };

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
          {/* Header Card */}
          <View style={styles.headerCard}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
            <View style={styles.monthlySavingsContainer}>
              <Text style={styles.monthlySavingsLabel}>Este mes has ahorrado:</Text>
              <Text style={styles.monthlySavingsAmount}>{formatCurrency(totalSaved)}</Text>
            </View>
          </View>

          {/* Notificación de solicitud completada */}
          {completedRequests.length > 0 && (
            <View style={styles.poolNotification}>
              <View style={styles.poolNotificationHeader}>
                <Text style={styles.poolNotificationEmoji}>🎉</Text>
                <View style={styles.poolNotificationContent}>
                  <Text style={styles.poolNotificationTitle}>
                    ¡Tu solicitud fue completada!
                  </Text>
                  <Text style={styles.poolNotificationText}>
                    Recibiste ${completedRequests[0].amount} del Pozo de Ahorro
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={styles.poolNotificationButton}
                onPress={() => navigation.navigate('SavingsPoolTab')}
              >
                <Text style={styles.poolNotificationButtonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          )}

          {activeGoals.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyEmoji}>🎯</Text>
              </View>
              <Text style={styles.emptyTitle}>
                {goals.length === 0 ? '¡Crea tu primera meta!' : '¡Crea una nueva meta!'}
              </Text>
              <Text style={styles.emptyText}>
                Define qué quieres lograr y empieza{'\n'}tu camino de ahorro
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => navigation.navigate(ROUTES.CREATE_GOAL)}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>Crear Meta</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Meta activa</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{activeGoals.length}</Text>
                  </View>
                </View>
                {activeGoals.map(goal => (
                  <GoalCard
                    key={goal.id}
                    goal={goal}
                    onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goalId: goal.id })}
                  />
                ))}
              </View>

              <View style={styles.kambioSection}>
                <KambioButton onPress={handleKambio} loading={kambioLoading} />
                <Text style={styles.kambioHint}>
                  ¿Evitaste un gasto hormiga?{' '}
                  <Text style={styles.kambioHintBold}>¡Regístralo!</Text>
                </Text>
              </View>

              <View style={styles.section}>
                <TouchableOpacity
                  style={styles.newGoalHeader}
                  onPress={() => navigation.navigate(ROUTES.CREATE_GOAL)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.sectionTitle}>Crea una nueva meta</Text>
                  <Text style={styles.arrowIcon}>→</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {completedGoals.length > 0 && (
            <View style={styles.section}>
              <TouchableOpacity
                style={styles.collapsibleHeader}
                onPress={toggleCompleted}
                activeOpacity={0.7}
              >
                <View style={[styles.sectionHeader, { marginBottom: 0 }]}>
                  <Text style={styles.sectionTitle}>Metas completadas</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{completedGoals.length}</Text>
                  </View>
                </View>
                <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                  <Text style={styles.arrowIcon}>▼</Text>
                </Animated.View>
              </TouchableOpacity>
              
              <Animated.View
                style={{
                  opacity: heightAnim,
                  maxHeight: heightAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 1000]
                  }),
                  overflow: 'hidden'
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
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.lg,
    margin: SPACING.md,
    marginTop: SPACING.md,
    ...SHADOWS.md
  },
  greeting: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    fontWeight: '500',
    opacity: 0.9
  },
  userName: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.textLight,
    marginTop: SPACING.xs,
    letterSpacing: -0.5
  },
  monthlySavingsContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md,
    alignItems: 'center'
  },
  monthlySavingsLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    opacity: 0.9,
    marginBottom: SPACING.xs / 2
  },
  monthlySavingsAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.textLight
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.md
  },
  collapsibleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md
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
  arrowIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    fontWeight: '700'
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
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight
  },
  celebrationEmoji: {
    fontSize: FONT_SIZES.xl,
    marginLeft: SPACING.sm
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xxl,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  emptyEmoji: {
    fontSize: 40
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
    marginBottom: SPACING.xxl,
    lineHeight: FONT_SIZES.md * 1.5
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xxl,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md
  },
  createButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  },
  kambioSection: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.md,
    alignItems: 'center'
  },
  kambioHint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
    fontWeight: '500'
  },
  kambioHintBold: {
    fontWeight: '700',
    color: COLORS.primary
  },
  newGoalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    borderColor: COLORS.primaryLight,
    ...SHADOWS.sm
  },
  poolNotification: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm
  },
  poolNotificationHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm
  },
  poolNotificationEmoji: {
    fontSize: FONT_SIZES.xxl,
    marginRight: SPACING.sm
  },
  poolNotificationContent: {
    flex: 1
  },
  poolNotificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2
  },
  poolNotificationText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.95
  },
  poolNotificationButton: {
    backgroundColor: COLORS.textLight,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'flex-start'
  },
  poolNotificationButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success
  }
});

export default DashboardScreen;
