import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../../utils/constants';
import { getAllGoals } from '../../../services/goalService';
import { formatCurrency, formatDate } from '../../../utils/helpers';

const AhorrosTab = ({ navigation }) => {
  const [kambios, setKambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState('all'); // 'all' or 'YYYY-MM'

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadKambios();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadKambios();
    }, [])
  );

  const loadKambios = async () => {
    try {
      const goalsResponse = await getAllGoals();
      const allGoals = goalsResponse.goals || [];

      // Collect all kambios from all goals
      const allKambios = [];
      let total = 0;

      allGoals.forEach(goal => {
        if (goal.kambios && goal.kambios.length > 0) {
          goal.kambios.forEach(kambio => {
            allKambios.push({
              ...kambio,
              goalName: goal.name,
              goalId: goal.id
            });
            total += parseFloat(kambio.amount);
          });
        }
      });

      // Sort by date (most recent first)
      allKambios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setKambios(allKambios);
      setTotalSaved(total);
    } catch (error) {
      console.error('Error loading kambios:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadKambios();
  };

  // Group kambios by month
  const groupByMonth = (kambios) => {
    const groups = {};
    kambios.forEach(kambio => {
      const date = new Date(kambio.created_at);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      const monthName = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });

      if (!groups[monthKey]) {
        groups[monthKey] = {
          name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
          kambios: [],
          total: 0
        };
      }

      groups[monthKey].kambios.push(kambio);
      groups[monthKey].total += parseFloat(kambio.amount);
    });

    return Object.values(groups);
  };

  const allMonthlyGroups = groupByMonth(kambios);

  // Get available months for filter
  const availableMonths = allMonthlyGroups.map(group => {
    const kambio = group.kambios[0];
    const date = new Date(kambio.created_at);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    return { key: monthKey, name: group.name };
  });

  // Filter kambios based on selected month
  const filteredKambios = selectedMonth === 'all'
    ? kambios
    : kambios.filter(k => {
        const date = new Date(k.created_at);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        return monthKey === selectedMonth;
      });

  const monthlyGroups = groupByMonth(filteredKambios);

  // Calculate filtered total
  const filteredTotal = filteredKambios.reduce((sum, k) => sum + parseFloat(k.amount), 0);

  return (
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
          <Text style={styles.title}>💰 Historial de Ahorros</Text>
          <Text style={styles.subtitle}>
            Todos tus Kambios en un solo lugar
          </Text>
        </View>

        {/* Month Filter */}
        {availableMonths.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.monthFilterContainer}
            contentContainerStyle={styles.monthFilterContent}
          >
            <TouchableOpacity
              style={[
                styles.monthFilterButton,
                selectedMonth === 'all' && styles.monthFilterButtonActive
              ]}
              onPress={() => setSelectedMonth('all')}
            >
              <Text style={[
                styles.monthFilterText,
                selectedMonth === 'all' && styles.monthFilterTextActive
              ]}>
                Todos
              </Text>
            </TouchableOpacity>
            {availableMonths.map((month, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.monthFilterButton,
                  selectedMonth === month.key && styles.monthFilterButtonActive
                ]}
                onPress={() => setSelectedMonth(month.key)}
              >
                <Text style={[
                  styles.monthFilterText,
                  selectedMonth === month.key && styles.monthFilterTextActive
                ]}>
                  {month.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Total Saved Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>
            {selectedMonth === 'all' ? 'Total Ahorrado' : 'Total del Mes'}
          </Text>
          <Text style={styles.totalAmount}>{formatCurrency(filteredTotal)}</Text>
          <Text style={styles.totalSubtext}>
            {filteredKambios.length} {filteredKambios.length === 1 ? 'Kambio realizado' : 'Kambios realizados'}
          </Text>
        </View>

        {/* Kambios List */}
        {kambios.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyEmoji}>💸</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin Kambios registrados</Text>
            <Text style={styles.emptyText}>
              Tus ahorros aparecerán aquí cuando{'\n'}registres tu primer Kambio
            </Text>
          </View>
        ) : (
          monthlyGroups.map((group, index) => (
            <View key={index} style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <Text style={styles.monthTitle}>{group.name}</Text>
                <Text style={styles.monthTotal}>{formatCurrency(group.total)}</Text>
              </View>

              {group.kambios.map((kambio, kambioIndex) => (
                <View key={kambioIndex} style={styles.kambioCard}>
                  <View style={styles.kambioHeader}>
                    <View style={styles.kambioIconContainer}>
                      <Text style={styles.kambioIcon}>💪</Text>
                    </View>
                    <View style={styles.kambioInfo}>
                      <Text style={styles.kambioGoal} numberOfLines={1}>
                        {kambio.goalName}
                      </Text>
                      <Text style={styles.kambioDate}>
                        {formatDate(kambio.created_at)}
                      </Text>
                    </View>
                    <Text style={styles.kambioAmount}>
                      +{formatCurrency(kambio.amount)}
                    </Text>
                  </View>
                  {kambio.description && (
                    <Text style={styles.kambioDescription}>
                      {kambio.description}
                    </Text>
                  )}
                </View>
              ))}
            </View>
          ))
        )}

        {/* Stats Summary */}
        {kambios.length > 0 && (
          <View style={styles.statsCard}>
            <Text style={styles.statsTitle}>📊 Estadísticas</Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {formatCurrency(totalSaved / (kambios.length || 1))}
                </Text>
                <Text style={styles.statLabel}>Promedio</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{kambios.length}</Text>
                <Text style={styles.statLabel}>Kambios</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{monthlyGroups.length}</Text>
                <Text style={styles.statLabel}>
                  {monthlyGroups.length === 1 ? 'Mes' : 'Meses'}
                </Text>
              </View>
            </View>
          </View>
        )}
      </Animated.View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.background
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
  totalCard: {
    backgroundColor: COLORS.primary,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.md
  },
  totalLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    opacity: 0.9
  },
  totalAmount: {
    fontSize: FONT_SIZES.xxxl * 1.2,
    fontWeight: '800',
    color: COLORS.textLight,
    letterSpacing: -1,
    marginBottom: SPACING.xs
  },
  totalSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.8
  },
  monthSection: {
    marginBottom: SPACING.lg
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary
  },
  monthTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  monthTotal: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary
  },
  kambioCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.success,
    ...SHADOWS.sm
  },
  kambioHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  kambioIconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.successAlpha20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm
  },
  kambioIcon: {
    fontSize: 20
  },
  kambioInfo: {
    flex: 1,
    marginRight: SPACING.sm
  },
  kambioGoal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xxs
  },
  kambioDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  kambioAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.success
  },
  kambioDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    marginTop: SPACING.sm,
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    fontStyle: 'italic'
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
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs / 2
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600',
    textAlign: 'center'
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border
  },
  monthFilterContainer: {
    marginBottom: SPACING.md
  },
  monthFilterContent: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm
  },
  monthFilterButton: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.border,
    marginRight: SPACING.sm
  },
  monthFilterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  monthFilterText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text
  },
  monthFilterTextActive: {
    color: COLORS.textLight
  }
});

export default AhorrosTab;
