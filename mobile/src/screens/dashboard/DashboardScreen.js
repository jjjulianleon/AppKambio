import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Alert,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getAllGoals, createKambio } from '../../services/goalService';
import { getStoredUser } from '../../services/authService';
import { getGreeting } from '../../utils/helpers';
import GoalCard from '../../components/GoalCard';
import KambioButton from '../../components/KambioButton';

const DashboardScreen = ({ navigation }) => {
  const [goals, setGoals] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [kambioLoading, setKambioLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;

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
    const activeGoal = goals.find(g => g.status === 'active');
    if (!activeGoal) {
      Alert.alert('Sin meta activa', 'Por favor crea una meta primero', [
        { text: 'Crear meta', onPress: () => navigation.navigate(ROUTES.CREATE_GOAL) },
        { text: 'Cancelar', style: 'cancel' }
      ]);
      return;
    }

    navigation.navigate(ROUTES.KAMBIO, { goal: activeGoal });
  };

  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

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
          <View style={styles.header}>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
          </View>

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
            </>
          )}

          {completedGoals.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Metas completadas</Text>
                <Text style={styles.celebrationEmoji}>🎉</Text>
              </View>
              {completedGoals.map(goal => (
                <GoalCard
                  key={goal.id}
                  goal={goal}
                  onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goalId: goal.id })}
                />
              ))}
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
    backgroundColor: COLORS.backgroundLight
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  header: {
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xl,
    paddingBottom: SPACING.lg
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  userName: {
    fontSize: FONT_SIZES.xxxl * 1.2,
    fontWeight: '800',
    color: COLORS.text,
    marginTop: SPACING.xs,
    letterSpacing: -0.5
  },
  section: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl * 1.5,
    marginHorizontal: SPACING.xl,
    marginTop: SPACING.xl,
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.xxl,
    ...SHADOWS.md
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary + '15',
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
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl,
    alignItems: 'center'
  },
  kambioHint: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    textAlign: 'center',
    fontWeight: '500'
  },
  kambioHintBold: {
    fontWeight: '700',
    color: COLORS.primary
  }
});

export default DashboardScreen;
