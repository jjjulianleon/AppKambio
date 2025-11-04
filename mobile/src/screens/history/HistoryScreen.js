import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { getAllKambios } from '../../services/goalService';
import { formatCurrency } from '../../utils/helpers';

const HistoryScreen = ({ navigation }) => {
  const [kambios, setKambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalKambios, setTotalKambios] = useState(0);

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
      const kambiosResponse = await getAllKambios();

      console.log('Kambios response received:', kambiosResponse);

      // Extract kambios array from response (structure: { kambios: [...] })
      const kambiosArray = kambiosResponse?.kambios || [];
      console.log('Kambios array:', kambiosArray);

      // Map kambios and include goal name if available
      let allKambios = [];
      if (Array.isArray(kambiosArray) && kambiosArray.length > 0) {
        allKambios = kambiosArray.map(k => {
          const kambio = {
            id: k.id || Math.random(),
            amount: k.amount,
            transaction_type: k.transaction_type || 'credit', // Default to credit if not specified
            description: k.description,
            created_at: k.created_at,
            updated_at: k.updated_at,
            goal_id: k.goal_id,
            user_id: k.user_id,
            expense_category_id: k.expense_category_id,
            pool_contribution_id: k.pool_contribution_id,
            pool_request_id: k.pool_request_id,
            goalName: k.goal?.name || 'Meta de ahorro'
          };
          console.log('Processing kambio:', kambio.id, 'type:', kambio.transaction_type);
          return kambio;
        });
      }

      console.log('All kambios processed:', allKambios.length, 'kambios');

      // Sort by date (most recent first)
      allKambios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setKambios(allKambios);

      // Calculate totals (suma créditos, resta débitos)
      const total = allKambios.reduce((sum, k) => {
        const amount = parseFloat(k.amount || 0);
        return k.transaction_type === 'debit' ? sum - amount : sum + amount;
      }, 0);
      setTotalSaved(total);
      setTotalKambios(allKambios.length);

      console.log('History loaded - Total:', total, 'Count:', allKambios.length);
    } catch (error) {
      console.error('Error loading history:', error);
      console.error('Full error:', JSON.stringify(error, null, 2));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadHistory();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-EC', {
        day: 'numeric',
        month: 'short',
        year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
      });
    }
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

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={kambios}
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
                <Text style={styles.statValue}>{formatCurrency(totalSaved)}</Text>
                <Text style={styles.statLabel}>Total ahorrado</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{totalKambios}</Text>
                <Text style={styles.statLabel}>Kambios realizados</Text>
              </View>
            </View>

            {/* Section Title */}
            {kambios.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Últimos Kambios</Text>
              </View>
            )}
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyEmoji}>📊</Text>
            <Text style={styles.emptyTitle}>Sin historial aún</Text>
            <Text style={styles.emptyText}>
              Tus Kambios registrados aparecerán aquí
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
