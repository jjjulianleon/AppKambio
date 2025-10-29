import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  RefreshControl, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../utils/constants';
import { getAllKambios } from '../../services/goalService';

const HistoryScreen = ({ navigation }) => {
  const [kambios, setKambios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [totalKambios, setTotalKambios] = useState(0);

  useEffect(() => {
    loadHistory();
  }, []);

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
        allKambios = kambiosArray.map(k => ({
          ...k,
          goalName: k.goal?.name || 'Meta de ahorro', // Extract goal name from relationship
          id: k.id || Math.random() // Ensure id exists
        }));
      }

      console.log('All kambios processed:', allKambios);

      // Sort by date (most recent first)
      allKambios.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setKambios(allKambios);

      // Calculate totals
      const total = allKambios.reduce((sum, k) => sum + parseFloat(k.amount || 0), 0);
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

  const renderKambioItem = ({ item }) => (
    <View style={styles.kambioCard}>
      <View style={styles.kambioIcon}>
        <Text style={styles.kambioEmoji}>💪</Text>
      </View>
      <View style={styles.kambioInfo}>
        <Text style={styles.kambioGoal}>{item.goalName}</Text>
        <Text style={styles.kambioDescription}>
          {item.description || 'Ahorro registrado'}
        </Text>
        <Text style={styles.kambioDate}>{formatDate(item.created_at)}</Text>
      </View>
      <Text style={styles.kambioAmount}>${parseFloat(item.amount).toFixed(2)}</Text>
    </View>
  );

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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Progreso</Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>${totalSaved.toFixed(2)}</Text>
          <Text style={styles.statLabel}>Total ahorrado</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{totalKambios}</Text>
          <Text style={styles.statLabel}>Kambios realizados</Text>
        </View>
      </View>

      {kambios.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyEmoji}>📊</Text>
          <Text style={styles.emptyTitle}>Sin historial aún</Text>
          <Text style={styles.emptyText}>
            Tus Kambios registrados aparecerán aquí
          </Text>
        </View>
      ) : (
        <FlatList
          data={kambios}
          renderItem={renderKambioItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.surface
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    margin: SPACING.xl,
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  statLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs
  },
  statDivider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md
  },
  listContainer: { paddingHorizontal: SPACING.xl, paddingBottom: 80 },
  kambioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  kambioIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  kambioEmoji: { fontSize: 24 },
  kambioInfo: { flex: 1 },
  kambioGoal: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2
  },
  kambioDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: 2
  },
  kambioDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary
  },
  kambioAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.success
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xxl
  },
  emptyEmoji: { fontSize: 80, marginBottom: SPACING.lg },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  emptyText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center'
  }
});

export default HistoryScreen;
