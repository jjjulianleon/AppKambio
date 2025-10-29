import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity, Alert } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES } from '../../utils/constants';
import { getGoalById, deleteGoal } from '../../services/goalService';
import { formatCurrency, formatDate } from '../../utils/helpers';
import ProgressBar from '../../components/ProgressBar';

const GoalDetailScreen = ({ navigation, route }) => {
  const { goalId } = route.params;
  const [goal, setGoal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadGoal();
  }, []);

  const loadGoal = async () => {
    try {
      const response = await getGoalById(goalId);
      setGoal(response.goal);
    } catch (error) {
      Alert.alert('Error', 'No se pudo cargar la meta');
      navigation.goBack();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Eliminar meta',
      '¿Estás seguro de que quieres eliminar esta meta?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteGoal(goalId);
              Alert.alert('Meta eliminada', '', [
                { text: 'OK', onPress: () => navigation.goBack() }
              ]);
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar la meta');
            }
          }
        }
      ]
    );
  };

  if (loading || !goal) {
    return <View style={styles.container}><Text>Cargando...</Text></View>;
  }

  const kambios = goal.kambios || [];
  const isCompleted = goal.status === 'completed';

  return (
    <ScrollView
      style={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadGoal(); }} />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>{goal.name}</Text>
        {isCompleted && <Text style={styles.completedBadge}>✓ Completada</Text>}
      </View>

      <View style={styles.section}>
        <ProgressBar
          current={parseFloat(goal.current_amount)}
          target={parseFloat(goal.target_amount)}
          showLabels={true}
        />
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kambios realizados ({kambios.length})</Text>
        {kambios.length === 0 ? (
          <Text style={styles.emptyText}>Aún no has registrado ningún Kambio</Text>
        ) : (
          kambios.map(kambio => (
            <View key={kambio.id} style={styles.kambioItem}>
              <View>
                <Text style={styles.kambioAmount}>{formatCurrency(kambio.amount)}</Text>
                <Text style={styles.kambioDate}>{formatDate(kambio.created_at)}</Text>
                {kambio.description && (
                  <Text style={styles.kambioDescription}>{kambio.description}</Text>
                )}
              </View>
            </View>
          ))
        )}
      </View>

      {!isCompleted && (
        <TouchableOpacity
          style={styles.kambioButton}
          onPress={() => navigation.navigate(ROUTES.KAMBIO, { goal })}
        >
          <Text style={styles.kambioButtonText}>Registrar Kambio</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
        <Text style={styles.deleteButtonText}>Eliminar meta</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  header: { padding: SPACING.xl, backgroundColor: COLORS.surface },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text },
  completedBadge: { fontSize: FONT_SIZES.md, color: COLORS.success, fontWeight: 'bold', marginTop: SPACING.sm },
  section: { padding: SPACING.xl, backgroundColor: COLORS.surface, marginTop: SPACING.sm },
  sectionTitle: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.md },
  emptyText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', paddingVertical: SPACING.xl },
  kambioItem: { backgroundColor: COLORS.background, padding: SPACING.md, borderRadius: BORDER_RADIUS.md, marginBottom: SPACING.sm },
  kambioAmount: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.primary },
  kambioDate: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  kambioDescription: { fontSize: FONT_SIZES.sm, color: COLORS.text, marginTop: SPACING.xs },
  kambioButton: { backgroundColor: COLORS.primary, margin: SPACING.xl, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl, alignItems: 'center' },
  kambioButtonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight },
  deleteButton: { 
    backgroundColor: COLORS.error, 
    margin: SPACING.xl, 
    marginTop: SPACING.md,
    paddingVertical: SPACING.md, 
    borderRadius: BORDER_RADIUS.xl, 
    alignItems: 'center' 
  },
  deleteButtonText: { fontSize: FONT_SIZES.md, fontWeight: 'bold', color: COLORS.textLight }
});

export default GoalDetailScreen;
