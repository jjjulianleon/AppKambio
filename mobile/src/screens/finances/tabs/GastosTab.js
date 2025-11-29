import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Animated
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../../utils/constants';
import { getAllTransactions } from '../../../services/transactionService';
import { formatCurrency } from '../../../utils/helpers';

const GastosTab = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [categoryStats, setCategoryStats] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Category emoji mapping
  const categoryEmojis = {
    'Comida': '🍔',
    'Transporte': '🚗',
    'Entretenimiento': '🎬',
    'Ropa': '👕',
    'Salud': '🏥',
    'Educación': '📚',
    'Servicios': '💡',
    'Otros': '📦'
  };

  const categoryColors = {
    'Comida': '#FF6B6B',
    'Transporte': '#4ECDC4',
    'Entretenimiento': '#95E1D3',
    'Ropa': '#F38181',
    'Salud': '#AA96DA',
    'Educación': '#FCBAD3',
    'Servicios': '#FFFFD2',
    'Otros': '#A8D8EA'
  };

  useEffect(() => {
    loadTransactions();
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true
    }).start();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadTransactions();
    }, [])
  );

  const loadTransactions = async () => {
    try {
      const response = await getAllTransactions();
      const allTransactions = response.transactions || [];

      // Filter only expenses (negative amounts)
      const expenses = allTransactions.filter(t => parseFloat(t.amount) < 0);

      // Calculate category statistics
      const categoryMap = {};
      let total = 0;

      expenses.forEach(transaction => {
        const category = transaction.category || 'Otros';
        const amount = Math.abs(parseFloat(transaction.amount));

        if (!categoryMap[category]) {
          categoryMap[category] = {
            name: category,
            total: 0,
            count: 0,
            emoji: categoryEmojis[category] || '📦',
            color: categoryColors[category] || '#A8D8EA'
          };
        }

        categoryMap[category].total += amount;
        categoryMap[category].count += 1;
        total += amount;
      });

      // Convert to array and sort by total
      const stats = Object.values(categoryMap).sort((a, b) => b.total - a.total);

      // Calculate percentages
      stats.forEach(stat => {
        stat.percentage = total > 0 ? (stat.total / total) * 100 : 0;
      });

      setTransactions(expenses);
      setCategoryStats(stats);
      setTotalExpenses(total);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadTransactions();
  };

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
          <Text style={styles.title}>🐜 Gastos Hormiga</Text>
          <Text style={styles.subtitle}>
            Analiza tus pequeños gastos diarios
          </Text>
        </View>

        {/* Total Expenses Card */}
        <View style={styles.totalCard}>
          <Text style={styles.totalLabel}>Gastos Totales</Text>
          <Text style={styles.totalAmount}>{formatCurrency(totalExpenses)}</Text>
          <Text style={styles.totalSubtext}>
            {transactions.length} {transactions.length === 1 ? 'gasto registrado' : 'gastos registrados'}
          </Text>
        </View>

        {/* Category Breakdown */}
        {categoryStats.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Text style={styles.emptyEmoji}>📊</Text>
            </View>
            <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
            <Text style={styles.emptyText}>
              Tus gastos por categoría{'\n'}aparecerán aquí
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Por Categoría</Text>

              {categoryStats.map((category, index) => (
                <View key={index} style={styles.categoryCard}>
                  <View style={styles.categoryHeader}>
                    <View style={[styles.categoryIconContainer, { backgroundColor: category.color + '40' }]}>
                      <Text style={styles.categoryIcon}>{category.emoji}</Text>
                    </View>
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{category.name}</Text>
                      <Text style={styles.categoryCount}>
                        {category.count} {category.count === 1 ? 'gasto' : 'gastos'}
                      </Text>
                    </View>
                    <View style={styles.categoryAmountContainer}>
                      <Text style={styles.categoryAmount}>
                        {formatCurrency(category.total)}
                      </Text>
                      <Text style={styles.categoryPercentage}>
                        {category.percentage.toFixed(1)}%
                      </Text>
                    </View>
                  </View>

                  {/* Progress bar */}
                  <View style={styles.progressBarContainer}>
                    <View style={styles.progressBarBackground}>
                      <View
                        style={[
                          styles.progressBarFill,
                          {
                            width: `${category.percentage}%`,
                            backgroundColor: category.color
                          }
                        ]}
                      />
                    </View>
                  </View>
                </View>
              ))}
            </View>

            {/* Stats Summary */}
            <View style={styles.statsCard}>
              <Text style={styles.statsTitle}>📊 Análisis</Text>
              <View style={styles.statsRow}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {formatCurrency(totalExpenses / (transactions.length || 1))}
                  </Text>
                  <Text style={styles.statLabel}>Promedio</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{categoryStats.length}</Text>
                  <Text style={styles.statLabel}>Categorías</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>
                    {categoryStats[0] ? categoryStats[0].emoji : '📦'}
                  </Text>
                  <Text style={styles.statLabel}>Top Gasto</Text>
                </View>
              </View>
            </View>

            {/* Tips Card */}
            <View style={styles.tipsCard}>
              <Text style={styles.tipsIcon}>💡</Text>
              <Text style={styles.tipsTitle}>Tip de Ahorro</Text>
              <Text style={styles.tipsText}>
                Los gastos hormiga son pequeños gastos diarios que pueden sumar grandes cantidades al mes.
                ¡Identifica tus categorías principales y encuentra oportunidades de ahorro!
              </Text>
            </View>
          </>
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
    backgroundColor: COLORS.error,
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
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  categoryCard: {
    backgroundColor: COLORS.surface,
    marginBottom: SPACING.sm,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm
  },
  categoryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm
  },
  categoryIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  categoryIcon: {
    fontSize: 24
  },
  categoryInfo: {
    flex: 1
  },
  categoryName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xxs
  },
  categoryCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  categoryAmountContainer: {
    alignItems: 'flex-end'
  },
  categoryAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xxs
  },
  categoryPercentage: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary
  },
  progressBarContainer: {
    marginTop: SPACING.xs
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.round
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
    marginBottom: SPACING.md,
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
  tipsCard: {
    backgroundColor: COLORS.primaryLight,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary
  },
  tipsIcon: {
    fontSize: 32,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  tipsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight,
    marginBottom: SPACING.sm,
    textAlign: 'center'
  },
  tipsText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: FONT_SIZES.md * 1.6,
    textAlign: 'center'
  }
});

export default GastosTab;
