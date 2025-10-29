import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  RefreshControl, TouchableOpacity, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, DEFAULT_KAMBIO_AMOUNT } from '../../utils/constants';
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

  useEffect(() => {
    loadData();
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
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{getGreeting()}</Text>
          <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
        </View>

        {activeGoals.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>🎯</Text>
            <Text style={styles.emptyTitle}>
              {goals.length === 0 ? '¡Crea tu primera meta!' : '¡Crea una nueva meta!'}
            </Text>
            <Text style={styles.emptyText}>
              Define qué quieres lograr y empieza tu camino de ahorro
            </Text>
            <TouchableOpacity
              style={styles.createButton}
              onPress={() => navigation.navigate(ROUTES.CREATE_GOAL)}
            >
              <Text style={styles.createButtonText}>Crear Meta</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Meta activa</Text>
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
                ¿Evitaste un gasto hormiga? ¡Regístralo!
              </Text>
            </View>
          </>
        )}

        {completedGoals.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Metas completadas 🎉</Text>
            {completedGoals.map(goal => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={() => navigation.navigate(ROUTES.GOAL_DETAIL, { goalId: goal.id })}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 80 },
  header: { padding: SPACING.xl, paddingTop: SPACING.xxl },
  greeting: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  userName: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.xs },
  section: { padding: SPACING.xl },
  sectionTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  emptyState: { alignItems: 'center', padding: SPACING.xxl, marginTop: SPACING.xxl },
  emptyEmoji: { fontSize: 80, marginBottom: SPACING.lg },
  emptyTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.xl },
  createButton: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl },
  createButtonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight },
  kambioSection: { padding: SPACING.xl, alignItems: 'center' },
  kambioHint: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.md, textAlign: 'center' }
});

export default DashboardScreen;
