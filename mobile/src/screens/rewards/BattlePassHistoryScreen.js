import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import api from '../../services/api';

const BattlePassHistoryScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const response = await api.get('/battle-pass/history');
      setHistory(response.data.history || []);
    } catch (error) {
      console.error('Error loading battle pass history:', error);
      Alert.alert('Error', 'No se pudo cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const getMonthName = (month, year) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return `${months[month - 1]} ${year}`;
  };

  const isCurrentMonth = (month, year) => {
    const now = new Date();
    return month === now.getMonth() + 1 && year === now.getFullYear();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando historial...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (history.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📊</Text>
          <Text style={styles.emptyTitle}>Sin Historial</Text>
          <Text style={styles.emptyText}>
            Comienza a ahorrar para ver tu progreso mensual aquí
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.header}>
          <Text style={styles.title}>📊 Historial de Battle Pass</Text>
          <Text style={styles.subtitle}>
            Tu progreso en los últimos meses
          </Text>
        </View>

        {history.map((item, index) => {
          const isCurrent = isCurrentMonth(item.month, item.year);
          
          return (
            <View 
              key={`${item.year}-${item.month}`} 
              style={[
                styles.historyCard,
                isCurrent && styles.currentMonthCard
              ]}
            >
              {isCurrent && (
                <View style={styles.currentBadge}>
                  <Text style={styles.currentBadgeText}>Mes Actual</Text>
                </View>
              )}
              
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.monthText}>
                    {getMonthName(item.month, item.year)}
                  </Text>
                  <Text style={styles.levelText}>
                    Nivel {item.current_level}
                  </Text>
                </View>
                <View style={styles.savingsContainer}>
                  <Text style={styles.savingsLabel}>Ahorrado</Text>
                  <Text style={styles.savingsAmount}>
                    {formatCurrency(item.total_savings)}
                  </Text>
                </View>
              </View>

              <View style={styles.progressBarContainer}>
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { 
                        width: `${Math.min((item.total_savings / 300) * 100, 100)}%`,
                        backgroundColor: isCurrent ? COLORS.primary : COLORS.success
                      }
                    ]} 
                  />
                </View>
              </View>

              {item.unlockedRewards > 0 && (
                <View style={styles.rewardsRow}>
                  <Text style={styles.rewardsText}>
                    🎁 {item.unlockedRewards} recompensa{item.unlockedRewards > 1 ? 's' : ''} desbloqueada{item.unlockedRewards > 1 ? 's' : ''}
                  </Text>
                </View>
              )}

              {item.completedChallenges > 0 && (
                <View style={styles.challengesRow}>
                  <Text style={styles.challengesText}>
                    ⚡ {item.completedChallenges} desafío{item.completedChallenges > 1 ? 's' : ''} completado{item.completedChallenges > 1 ? 's' : ''}
                  </Text>
                </View>
              )}
            </View>
          );
        })}

        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📈 Estadísticas Totales</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {formatCurrency(history.reduce((sum, item) => sum + item.total_savings, 0))}
              </Text>
              <Text style={styles.statLabel}>Total Ahorrado</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {history.reduce((sum, item) => sum + item.unlockedRewards, 0)}
              </Text>
              <Text style={styles.statLabel}>Recompensas</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>
                {Math.max(...history.map(item => item.current_level))}
              </Text>
              <Text style={styles.statLabel}>Nivel Máximo</Text>
            </View>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: SPACING.lg
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22
  },
  scrollContent: {
    paddingHorizontal: SPACING.lg
  },
  header: {
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
    alignItems: 'center'
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  historyCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  currentMonthCard: {
    borderWidth: 2,
    borderColor: COLORS.primary
  },
  currentBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm
  },
  currentBadgeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.white,
    fontWeight: '600'
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md
  },
  monthText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text
  },
  levelText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2
  },
  savingsContainer: {
    alignItems: 'flex-end'
  },
  savingsLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  savingsAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary
  },
  progressBarContainer: {
    marginBottom: SPACING.md
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    borderRadius: BORDER_RADIUS.sm
  },
  rewardsRow: {
    paddingTop: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.backgroundLight,
    marginTop: SPACING.sm
  },
  rewardsText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.success,
    fontWeight: '600'
  },
  challengesRow: {
    marginTop: SPACING.xs
  },
  challengesText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.primary,
    fontWeight: '600'
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    ...SHADOWS.md
  },
  statsTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.lg,
    textAlign: 'center'
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statValue: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center'
  },
  bottomPadding: {
    height: 100
  }
});

export default BattlePassHistoryScreen;
