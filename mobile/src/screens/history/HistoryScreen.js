import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { getKambiosWithMonthlySummary } from '../../services/goalService';
import { formatCurrency } from '../../utils/helpers';

const HistoryScreen = ({ navigation }) => {
  const [displayMode, setDisplayMode] = useState('all'); // 'all' or specific month 'YYYY-MM'
  const [kambios, setKambios] = useState([]);
  const [monthlySummary, setMonthlySummary] = useState([]);
  const [totalHistorical, setTotalHistorical] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadHistory();
    }, [])
  );

  const loadHistory = async () => {
    try {
      const data = await getKambiosWithMonthlySummary();

      console.log('Data with monthly summary:', {
        totalHistorical: data.totalHistorical,
        monthlySummaryCount: data.monthlySummary.length,
        allKambiosCount: data.allKambios.length
      });

      // Process all kambios to include goal name
      let processedKambios = [];
      if (Array.isArray(data.allKambios) && data.allKambios.length > 0) {
        processedKambios = data.allKambios.map(k => ({
          id: k.id || Math.random(),
          amount: k.amount,
          transaction_type: k.transaction_type || 'credit',
          description: k.description,
          created_at: k.created_at,
          updated_at: k.updated_at,
          goal_id: k.goal_id,
          user_id: k.user_id,
          expense_category_id: k.expense_category_id,
          pool_contribution_id: k.pool_contribution_id,
          pool_request_id: k.pool_request_id,
          goalName: k.goal?.name || 'Meta de ahorro'
        }));
      }

      // Sort by date (most recent first)
      processedKambios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setKambios(processedKambios);
      setMonthlySummary(data.monthlySummary);
      setTotalHistorical(data.totalHistorical);
      setDisplayMode('all');

      console.log('History loaded - Total Historical:', data.totalHistorical);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  // Get kambios to display based on selected month
  const getDisplayedKambios = () => {
    if (displayMode === 'all') {
      return kambios;
    }
    // Filter by selected month
    return kambios.filter(k => {
      const kambioMonth = new Date(k.created_at).toISOString().slice(0, 7);
      return kambioMonth === displayMode;
    });
  };

  // Get total for displayed kambios
  const getDisplayedTotal = () => {
    if (displayMode === 'all') {
      return totalHistorical;
    }
    const monthData = monthlySummary.find(m => m.month === displayMode);
    return monthData ? monthData.total : 0;
  };

  const formatMonthLabel = (monthString) => {
    const [year, month] = monthString.split('-');
    const date = new Date(year, parseInt(month) - 1);
    return date.toLocaleDateString('es-EC', { month: 'long', year: 'numeric' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    // Format with complete date and time
    const dateStr = date.toLocaleDateString('es-EC', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const timeStr = date.toLocaleTimeString('es-EC', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });

    return `${dateStr} ${timeStr}`;
  };

  const renderKambioItem = ({ item }) => {
    const isDebit = item.transaction_type === 'debit';

    return (
      <View style={styles.kambioCard}>
        <View style={styles.kambioIcon}>
          <Text style={styles.kambioEmoji}>{isDebit ? '🤝' : '💪'}</Text>
        </View>
        <View style={styles.kambioInfo}>
          <Text style={styles.kambioGoal}>{item.goalName}</Text>
          <Text style={styles.kambioDescription}>
            {item.description || 'Ahorro registrado'}
          </Text>
          <Text style={styles.kambioDate}>{formatDate(item.created_at)}</Text>
        </View>
        <Text style={[
          styles.kambioAmount,
          isDebit ? styles.kambioAmountDebit : styles.kambioAmountCredit
        ]}>
          {isDebit ? '- ' : '+ '}{formatCurrency(parseFloat(item.amount))}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const displayedKambios = getDisplayedKambios();
  const displayedTotal = getDisplayedTotal();

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={displayedKambios}
        renderItem={renderKambioItem}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        ListHeaderComponent={
          <>
            {/* Header Card with gradient background */}
            <View style={styles.headerCard}>
              <Text style={styles.headerEmoji}>📊</Text>
              <Text style={styles.headerTitle}>Mi Kambio</Text>
              <Text style={styles.headerSubtitle}>Registro de todos tus Kambios</Text>
            </View>

            {/* Stats Card */}
            <View style={styles.statsCard}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{formatCurrency(displayedTotal)}</Text>
                <Text style={styles.statLabel}>
                  {displayMode === 'all' ? 'Total histórico' : 'Total en ' + formatMonthLabel(displayMode)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{displayedKambios.length}</Text>
                <Text style={styles.statLabel}>Kambios</Text>
              </View>
            </View>

            {/* Filter Section - Monthly Selection */}
            {monthlySummary.length > 0 && (
              <View style={styles.filterSection}>
                <Text style={styles.filterTitle}>Ver por período</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.filterScroll}
                  contentContainerStyle={styles.filterContent}
                >
                  {/* All time button */}
                  <TouchableOpacity
                    style={[
                      styles.filterButton,
                      displayMode === 'all' && styles.filterButtonActive
                    ]}
                    onPress={() => setDisplayMode('all')}
                  >
                    <Text style={[
                      styles.filterButtonText,
                      displayMode === 'all' && styles.filterButtonTextActive
                    ]}>
                      📈 Todo
                    </Text>
                  </TouchableOpacity>

                  {/* Monthly buttons */}
                  {monthlySummary.map((monthData) => (
                    <TouchableOpacity
                      key={monthData.month}
                      style={[
                        styles.filterButton,
                        displayMode === monthData.month && styles.filterButtonActive
                      ]}
                      onPress={() => setDisplayMode(monthData.month)}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        displayMode === monthData.month && styles.filterButtonTextActive
                      ]}>
                        {formatMonthLabel(monthData.month).charAt(0).toUpperCase() + formatMonthLabel(monthData.month).slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            )}

            {/* Section Title */}
            {displayedKambios.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {displayMode === 'all' ? 'Todos los Kambios' : 'Kambios de ' + formatMonthLabel(displayMode)}
                </Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>
              {displayMode === 'all' ? 'Sin historial aún' : 'Sin Kambios en este mes'}
            </Text>
            <Text style={styles.emptyText}>
              {displayMode === 'all'
                ? 'Tus Kambios registrados aparecerán aquí'
                : 'No hay registros de ahorro para este período'
              }
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    margin: SPACING.md,
    marginTop: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md
  },
  headerEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.xs
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.9
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.md,
    marginTop: SPACING.sm,
    padding: SPACING.md,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  statValue: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  statNumber: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.xs * 1.3
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: SPACING.md
  },
  filterSection: {
    marginHorizontal: SPACING.md,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md
  },
  filterTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    paddingHorizontal: SPACING.sm
  },
  filterScroll: {
    marginHorizontal: -SPACING.sm
  },
  filterContent: {
    paddingHorizontal: SPACING.sm,
    gap: SPACING.sm
  },
  filterButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginRight: SPACING.sm,
    minWidth: 100,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.xs
  },
  filterButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary
  },
  filterButtonText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text
  },
  filterButtonTextActive: {
    color: COLORS.textLight
  },
  filterButtonAmount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs / 2
  },
  filterButtonAmountActive: {
    color: COLORS.textLight
  },
  sectionHeader: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.sm
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text
  },
  listContainer: {
    paddingBottom: SPACING.xl
  },
  kambioCard: {
    marginHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.sm,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
    ...SHADOWS.sm
  },
  kambioIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm
  },
  kambioEmoji: {
    fontSize: 32
  },
  kambioInfo: {
    flex: 1
  },
  kambioGoal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2
  },
  kambioDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs / 2
  },
  kambioDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary
  },
  kambioAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text
  },
  kambioAmountCredit: {
    color: COLORS.success
  },
  kambioAmountDebit: {
    color: COLORS.error
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.xxl
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: SPACING.md
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.md * 1.5
  }
});

export default HistoryScreen;
