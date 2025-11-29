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
import { getAllGoals, getKambiosWithMonthlySummary, completeGoal } from '../../services/goalService';
import { getStoredUser } from '../../services/authService';
import * as savingsPoolService from '../../services/savingsPoolService';
import { getGreeting, formatCurrency } from '../../utils/helpers';
import api from '../../services/api';
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
  const [battlePassData, setBattlePassData] = useState(null);

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

      // Cargar datos del Battle Pass
      try {
        const battlePassResponse = await api.get('/battle-pass/current');
        setBattlePassData(battlePassResponse.data);
      } catch (battlePassError) {
        console.log('Battle Pass data not available:', battlePassError);
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
    // NEW: No need to select goal - all savings go to general pool
    navigation.navigate(ROUTES.KAMBIO);
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
              loadData(); // Reload to update the list
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
            <View style={styles.headerTop}>
              <View style={styles.headerGreeting}>
                <Text style={styles.greeting}>{getGreeting()}</Text>
                <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
              </View>
              <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => {
                  haptics.selection();
                  navigation.navigate('CoachTab');
                }}
                activeOpacity={0.7}
              >
                <View style={styles.settingsIcon}>
                  <Text style={styles.settingsIconText}>⚙️</Text>
                </View>
              </TouchableOpacity>
            </View>
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
                onPress={() => navigation.navigate('ProgressTab')}
              >
                <Text style={styles.poolNotificationButtonText}>Ver detalles</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Widget de IA - Consejo del Día */}
          <TouchableOpacity
            style={styles.aiWidget}
            onPress={() => {
              haptics.selection();
              navigation.navigate('CoachTab');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.aiWidgetHeader}>
              <Text style={styles.aiWidgetIcon}>🧠</Text>
              <Text style={styles.aiWidgetTitle}>Consejo del Día</Text>
            </View>
            <Text style={styles.aiWidgetText} numberOfLines={2}>
              Tu coach financiero tiene tips para ti
            </Text>
            <Text style={styles.aiWidgetLink}>Ver más →</Text>
          </TouchableOpacity>

          {/* Widget de Battle Pass */}
          <TouchableOpacity
            style={styles.battlePassWidget}
            onPress={() => {
              haptics.selection();
              navigation.navigate('ProgressTab');
            }}
            activeOpacity={0.8}
          >
            <View style={styles.battlePassHeader}>
              <Text style={styles.battlePassIcon}>🏆</Text>
              <View style={styles.battlePassInfo}>
                <Text style={styles.battlePassTitle}>Battle Pass</Text>
                <Text style={styles.battlePassLevel}>
                  Nivel {battlePassData?.battlePass?.current_level || 0}
                </Text>
              </View>
            </View>
            <View style={styles.battlePassProgress}>
              <View style={styles.battlePassBar}>
                <View style={[
                  styles.battlePassFill,
                  { width: `${battlePassData?.progressPercentage || 0}%` }
                ]} />
              </View>
              <Text style={styles.battlePassText}>
                {battlePassData?.battlePass?.total_savings > 0
                  ? `${formatCurrency(battlePassData.battlePass.total_savings)} ahorrados este mes`
                  : 'Comienza a ahorrar para subir de nivel'
                }
              </Text>
            </View>
          </TouchableOpacity>

          {/* Botón Hacer Kambio - SUPER PROMINENTE */}
          <View style={styles.kambioSection}>
            <KambioButton onPress={handleKambio} loading={kambioLoading} />
            <Text style={styles.kambioHint}>
              ¿Evitaste un gasto hormiga?{' '}
              <Text style={styles.kambioHintBold}>¡Regístralo!</Text>
            </Text>
          </View>

          {/* Meta Principal (solo la más cercana a completar) */}
          {activeGoals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Tu Meta Principal</Text>
                {activeGoals.length > 1 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>+{activeGoals.length - 1}</Text>
                  </View>
                )}
              </View>
              <GoalCard
                goal={activeGoals[0]}
                onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goalId: activeGoals[0].id })}
                onComplete={handleCompleteGoal}
              />
              <TouchableOpacity
                style={styles.viewAllGoals}
                onPress={() => {
                  haptics.selection();
                  navigation.navigate('FinancesTab');
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllGoalsText}>
                  Ver todas las metas ({activeGoals.length})
                </Text>
                <Text style={styles.arrowIcon}>→</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Empty State - Sin metas */}
          {activeGoals.length === 0 && (
            <View style={styles.emptyState}>
              <View style={styles.emptyIconContainer}>
                <Text style={styles.emptyEmoji}>🎯</Text>
              </View>
              <Text style={styles.emptyTitle}>¡Crea tu primera meta!</Text>
              <Text style={styles.emptyText}>
                Define qué quieres lograr y empieza{'\n'}tu camino de ahorro
              </Text>
              <TouchableOpacity
                style={styles.createButton}
                onPress={() => {
                  haptics.medium();
                  navigation.navigate('FinancesTab');
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.createButtonText}>Crear Meta</Text>
              </TouchableOpacity>
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
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  headerGreeting: {
    flex: 1
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
  settingsButton: {
    marginLeft: SPACING.sm
  },
  settingsIcon: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)'
  },
  settingsIconText: {
    fontSize: 24
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
    color: COLORS.textLight,
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
  aiWidget: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    ...SHADOWS.sm
  },
  aiWidgetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  aiWidgetIcon: {
    fontSize: 24,
    marginRight: SPACING.sm
  },
  aiWidgetTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  aiWidgetText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.sm * 1.4
  },
  aiWidgetLink: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary
  },
  battlePassWidget: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  battlePassHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  battlePassIcon: {
    fontSize: 32,
    marginRight: SPACING.sm
  },
  battlePassInfo: {
    flex: 1
  },
  battlePassTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2
  },
  battlePassLevel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  battlePassProgress: {
    marginTop: SPACING.xs
  },
  battlePassBar: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.sm
  },
  battlePassFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.xs
  },
  battlePassText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary
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
  viewAllGoals: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    paddingHorizontal: SPACING.md,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md
  },
  viewAllGoalsText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight
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
