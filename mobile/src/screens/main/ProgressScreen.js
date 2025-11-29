import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import { haptics } from '../../utils/haptics';
import api from '../../services/api';
import * as savingsPoolService from '../../services/savingsPoolService';
import { getStoredUser } from '../../services/authService';
import ProgressRing from '../../components/ProgressRing';

const ProgressScreen = ({ navigation }) => {
  // Battle Pass State
  const [battlePass, setBattlePass] = useState(null);
  const [nextLevel, setNextLevel] = useState(null);
  const [progressPercentage, setProgressPercentage] = useState(0);
  const [unlockedRewardsCount, setUnlockedRewardsCount] = useState(0);
  const [totalRewards, setTotalRewards] = useState(0);

  // Pool State
  const [poolMembers, setPoolMembers] = useState([]);
  const [activeRequests, setActiveRequests] = useState([]);
  const [completedRequests, setCompletedRequests] = useState([]);
  const [userSavings, setUserSavings] = useState(0);
  const [userId, setUserId] = useState(null);

  // UI State
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [poolExpanded, setPoolExpanded] = useState(true);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadAllData();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadAllData();
    }, [])
  );

  const loadAllData = async () => {
    try {
      await Promise.all([loadBattlePassData(), loadPoolData()]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadBattlePassData = async () => {
    try {
      const currentResponse = await api.get('/battle-pass/current');
      const bp = currentResponse.data.battlePass;
      setBattlePass(bp);
      setNextLevel(currentResponse.data.nextLevel);
      setProgressPercentage(currentResponse.data.progressPercentage);

      const rewardsResponse = await api.get('/battle-pass/rewards');
      const rewardsList = rewardsResponse.data.rewards;
      const totalSavings = parseFloat(bp?.total_savings || 0);
      const unlocked = rewardsList.filter(r => totalSavings >= parseFloat(r.min_savings || 0)).length;
      setUnlockedRewardsCount(unlocked);
      setTotalRewards(rewardsList.length);
    } catch (error) {
      console.error('Error loading battle pass:', error);
    }
  };

  const loadPoolData = async () => {
    try {
      const user = await getStoredUser();
      if (user && user.id) {
        setUserId(user.id);
      }

      const poolData = await savingsPoolService.getPoolData();
      if (poolData) {
        setPoolMembers(poolData.members || []);
        setActiveRequests(poolData.activeRequests || []);
        setCompletedRequests(poolData.completedRequests || []);
        setUserSavings(poolData.userSavings !== undefined ? poolData.userSavings : 0);
      }
    } catch (error) {
      console.error('Error loading pool data:', error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadAllData();
  };

  const togglePool = () => {
    const willExpand = !poolExpanded;
    haptics.selection();
    setPoolExpanded(willExpand);

    Animated.timing(rotateAnim, {
      toValue: willExpand ? 1 : 0,
      duration: 300,
      useNativeDriver: true
    }).start();
  };

  const handleContribute = async (request) => {
    try {
      const contributionData = await savingsPoolService.calculateContribution(request.id);

      if (!contributionData || contributionData.maxPossible < 1) {
        Alert.alert(
          'No puedes contribuir',
          'No tienes suficientes ahorros para contribuir.'
        );
        return;
      }

      const maxContribution = contributionData.maxPossible;
      const suggestedAmount = contributionData.amount;
      const remaining = contributionData.remaining;

      Alert.prompt(
        'Contribuir al Pozo',
        `Ingresa el monto que deseas contribuir:\n\nMonto sugerido: ${formatCurrency(suggestedAmount)}\nMáximo permitido (50% de tus ahorros): ${formatCurrency(maxContribution)}\nTus ahorros: ${formatCurrency(userSavings)}\nFalta por completar: ${formatCurrency(remaining)}`,
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Contribuir',
            onPress: async (inputAmount) => {
              try {
                const amount = parseFloat(inputAmount);

                if (isNaN(amount) || amount <= 0) {
                  Alert.alert('Error', 'Por favor ingresa un monto válido mayor a 0');
                  return;
                }

                if (amount > maxContribution) {
                  Alert.alert('Error', `El monto máximo que puedes contribuir es ${formatCurrency(maxContribution)} (50% de tus ahorros)`);
                  return;
                }

                if (amount > remaining) {
                  Alert.alert('Error', `El monto excede lo que falta para completar la solicitud (${formatCurrency(remaining)})`);
                  return;
                }

                Alert.alert(
                  'Confirmar',
                  `¿Confirmas que deseas contribuir ${formatCurrency(amount)} a ${request.requester}?`,
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Confirmar',
                      onPress: async () => {
                        try {
                          await savingsPoolService.contributeToRequest(request.id, amount);
                          haptics.success();
                          Alert.alert('¡Éxito!', `Has contribuido ${formatCurrency(amount)} exitosamente`);
                          await loadAllData();
                        } catch (error) {
                          console.error('Error al contribuir:', error);
                          Alert.alert('Error', error.message || 'No se pudo completar la contribución');
                        }
                      }
                    }
                  ]
                );
              } catch (error) {
                console.error('Error procesando contribución:', error);
                Alert.alert('Error', 'Monto inválido');
              }
            }
          }
        ],
        'plain-text',
        suggestedAmount.toFixed(2)
      );
    } catch (error) {
      console.error('Error al calcular contribución:', error);
      Alert.alert('Error', 'No se pudo calcular la contribución');
    }
  };

  const handleDeleteRequest = async (request) => {
    Alert.alert(
      'Borrar Solicitud',
      `¿Estás seguro de que deseas borrar esta solicitud?\n\nSe reembolsará ${formatCurrency(request.currentAmount)} a los contribuidores.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Borrar',
          style: 'destructive',
          onPress: async () => {
            try {
              await savingsPoolService.deleteRequest(request.id);
              haptics.success();
              Alert.alert('¡Solicitud Borrada!', 'La solicitud ha sido borrada y los fondos han sido reembolsados.');
              await loadAllData();
            } catch (error) {
              console.error('Error al borrar solicitud:', error);
              Alert.alert('Error', error.message || 'No se pudo borrar la solicitud');
            }
          }
        }
      ]
    );
  };

  const getCurrentMonth = () => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const date = new Date();
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
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
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🏆 Mi Progreso</Text>
            <Text style={styles.subtitle}>
              Battle Pass y Pozo Compartido
            </Text>
          </View>

          {/* Battle Pass Section */}
          <View style={styles.battlePassCard}>
            <View style={styles.monthHeader}>
              <Text style={styles.monthTitle}>{getCurrentMonth()}</Text>
              <View style={styles.rewardsBadge}>
                <Text style={styles.rewardsBadgeText}>
                  {unlockedRewardsCount}/{totalRewards} 🎁
                </Text>
              </View>
            </View>

            {/* Progress Ring */}
            <View style={styles.progressSection}>
              <ProgressRing
                progress={progressPercentage}
                size={180}
                strokeWidth={18}
                current={battlePass?.total_savings || 0}
                target={nextLevel?.min_savings || 300}
              />

              <View style={styles.levelInfo}>
                <Text style={styles.levelLabel}>NIVEL {battlePass?.current_level || 0}</Text>
                <Text style={styles.progressText}>
                  {formatCurrency(battlePass?.total_savings || 0)} de {formatCurrency(nextLevel?.min_savings || 300)}
                </Text>
                {nextLevel && nextLevel.min_savings && battlePass && battlePass.total_savings !== undefined && (
                  <Text style={styles.nextLevelText}>
                    Faltan {formatCurrency(Math.max(0, nextLevel.min_savings - battlePass.total_savings))} para el siguiente nivel
                  </Text>
                )}
              </View>
            </View>

            {/* Battle Pass Actions */}
            <View style={styles.battlePassActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => {
                  haptics.medium();
                  navigation.navigate(ROUTES.BATTLE_PASS);
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.actionButtonText}>Ver Recompensas</Text>
                <Text style={styles.actionButtonIcon}>→</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Savings Pool Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderButton}
              onPress={togglePool}
              activeOpacity={0.7}
            >
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>🤝 Pozo Compartido</Text>
                <View style={styles.poolBadge}>
                  <Text style={styles.poolBadgeText}>{poolMembers.length} miembros</Text>
                </View>
              </View>
              <Animated.View style={{ transform: [{ rotate: arrowRotation }] }}>
                <Text style={styles.expandIcon}>▼</Text>
              </Animated.View>
            </TouchableOpacity>

            {poolExpanded && (
              <Animated.View style={{ opacity: fadeAnim }}>
                {/* User Savings Card */}
                <View style={styles.savingsCard}>
                  <Text style={styles.savingsLabel}>Tus Ahorros Disponibles</Text>
                  <Text style={styles.savingsAmount}>{formatCurrency(userSavings)}</Text>
                  <Text style={styles.savingsHint}>
                    Puedes contribuir hasta el 50%
                  </Text>
                </View>

                {/* Create Request Button */}
                <TouchableOpacity
                  style={styles.createRequestButton}
                  onPress={() => {
                    haptics.medium();
                    navigation.navigate('CreateRequest');
                  }}
                  activeOpacity={0.8}
                >
                  <View style={styles.createButtonContent}>
                    <View style={styles.createIconContainer}>
                      <Text style={styles.createIcon}>✋</Text>
                    </View>
                    <View style={styles.createTextContainer}>
                      <Text style={styles.createButtonTitle}>Solicitar Ayuda</Text>
                      <Text style={styles.createButtonSubtitle}>
                        El pozo está aquí para apoyarte
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.arrowIcon}>→</Text>
                </TouchableOpacity>

                {/* Active Requests */}
                {activeRequests.length > 0 && (
                  <View style={styles.requestsSection}>
                    <Text style={styles.requestsSectionTitle}>Solicitudes Activas</Text>
                    {activeRequests.map(request => {
                      const progress = (request.currentAmount / request.amount) * 100;
                      const remaining = request.amount - request.currentAmount;
                      const isOwnRequest = request.requesterId === userId;

                      return (
                        <View key={request.id} style={styles.requestCard}>
                          <View style={styles.requestHeader}>
                            <Text style={styles.requestRequester}>
                              {request.requester}{isOwnRequest ? ' (Tú)' : ''}
                            </Text>
                            <Text style={styles.requestContributors}>
                              {request.contributors} 👥
                            </Text>
                          </View>

                          <Text style={styles.requestDescription}>{request.description}</Text>

                          <View style={styles.amountContainer}>
                            <Text style={styles.amountLabel}>Progreso</Text>
                            <Text style={styles.amountValue}>
                              {formatCurrency(request.currentAmount)} / {formatCurrency(request.amount)}
                            </Text>
                          </View>

                          <View style={styles.progressBarContainer}>
                            <View style={[styles.progressBar, { width: `${progress}%` }]} />
                          </View>

                          <Text style={styles.remainingText}>
                            Faltan {formatCurrency(remaining)}
                          </Text>

                          {!isOwnRequest && (
                            <TouchableOpacity
                              style={styles.contributeButton}
                              onPress={() => handleContribute(request)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.contributeButtonText}>Contribuir</Text>
                            </TouchableOpacity>
                          )}

                          {isOwnRequest && (
                            <TouchableOpacity
                              style={styles.deleteButton}
                              onPress={() => handleDeleteRequest(request)}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.deleteButtonText}>Borrar Solicitud</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      );
                    })}
                  </View>
                )}

                {/* Completed Requests Summary */}
                {completedRequests.length > 0 && (
                  <View style={styles.completedSummary}>
                    <Text style={styles.completedSummaryIcon}>✅</Text>
                    <Text style={styles.completedSummaryText}>
                      {completedRequests.length} solicitud{completedRequests.length !== 1 ? 'es' : ''} completada{completedRequests.length !== 1 ? 's' : ''}
                    </Text>
                  </View>
                )}

                {/* Empty State */}
                {activeRequests.length === 0 && (
                  <View style={styles.emptyState}>
                    <Text style={styles.emptyEmoji}>🤝</Text>
                    <Text style={styles.emptyTitle}>Sin solicitudes activas</Text>
                    <Text style={styles.emptyText}>
                      Cuando alguien necesite ayuda, aparecerá aquí
                    </Text>
                  </View>
                )}
              </Animated.View>
            )}
          </View>

          {/* Summary Stats */}
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Resumen del Mes</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{battlePass?.current_level || 0}</Text>
                <Text style={styles.statLabel}>Nivel</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={[styles.statValue, styles.successStatValue]}>
                  {battlePass?.streak_days || 0}
                </Text>
                <Text style={styles.statLabel}>Racha</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{poolMembers.length}</Text>
                <Text style={styles.statLabel}>Miembros</Text>
              </View>
            </View>
          </View>
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
  battlePassCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  monthTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text
  },
  rewardsBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.round
  },
  rewardsBadgeText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.textLight
  },
  progressSection: {
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  levelInfo: {
    alignItems: 'center',
    marginTop: SPACING.lg
  },
  levelLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.primary,
    letterSpacing: 1,
    marginBottom: SPACING.xs
  },
  progressText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  nextLevelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  battlePassActions: {
    gap: SPACING.sm
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm
  },
  actionButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight
  },
  actionButtonIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    fontWeight: '700'
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg
  },
  sectionHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.md
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  poolBadge: {
    backgroundColor: COLORS.accent,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.round,
    marginLeft: SPACING.sm
  },
  poolBadgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textLight
  },
  expandIcon: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '700'
  },
  savingsCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm
  },
  savingsLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    opacity: 0.9,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: SPACING.xs / 2
  },
  savingsAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: SPACING.xs / 2,
    letterSpacing: -1
  },
  savingsHint: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    opacity: 0.85
  },
  createRequestButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.accent,
    marginBottom: SPACING.md,
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
    fontSize: 24,
    color: COLORS.textLight
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
  requestsSection: {
    marginBottom: SPACING.md
  },
  requestsSectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  requestCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  requestRequester: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text
  },
  requestContributors: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  requestDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    lineHeight: FONT_SIZES.sm * 1.4
  },
  amountContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  amountLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  amountValue: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.text
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.xs,
    overflow: 'hidden',
    marginBottom: SPACING.sm
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.xs
  },
  remainingText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  contributeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center'
  },
  contributeButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight
  },
  deleteButton: {
    backgroundColor: COLORS.error,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.sm,
    alignItems: 'center'
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight
  },
  completedSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm
  },
  completedSummaryIcon: {
    fontSize: FONT_SIZES.xl,
    marginRight: SPACING.sm
  },
  completedSummaryText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.success
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md
  },
  emptyTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  emptyText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
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
  successStatValue: {
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

export default ProgressScreen;
