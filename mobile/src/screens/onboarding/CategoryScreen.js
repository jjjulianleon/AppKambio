import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, PREDEFINED_CATEGORIES } from '../../utils/constants';

const CategoryScreen = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const toggleCategory = (category) => {
    if (selectedCategories.find(c => c.id === category.id)) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else {
      if (selectedCategories.length < 2) {
        setSelectedCategories([...selectedCategories, category]);
      } else {
        Alert.alert('Límite alcanzado', 'Puedes seleccionar máximo 2 categorías');
      }
    }
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert('Selecciona al menos una categoría', 'Elige 1 o 2 gastos hormiga que quieras reducir');
      return;
    }

    setLoading(true);
    try {
      await api.post('/expense-categories/bulk', {
        categories: selectedCategories.map(c => ({
          category_name: c.name,
          default_amount: c.defaultAmount
        }))
      });
      navigation.navigate(ROUTES.CREATE_GOAL, { isOnboarding: true });
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las categorías');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Gastos Hormiga</Text>
      <Text style={styles.subtitle}>Selecciona 1 o 2 categorías que quieras reducir</Text>

      <View style={styles.categoriesGrid}>
        {PREDEFINED_CATEGORIES.map(category => {
          const isSelected = selectedCategories.find(c => c.id === category.id);
          return (
            <TouchableOpacity
              key={category.id}
              style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
              onPress={() => toggleCategory(category)}
            >
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.categoryAmount}>${category.defaultAmount}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={styles.footer}>
        <Text style={styles.selectedText}>
          {selectedCategories.length} de 2 seleccionadas
        </Text>
        <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
          <Text style={styles.buttonText}>Continuar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xl },
  categoriesGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  categoryCard: { width: '48%', backgroundColor: COLORS.surface, padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg, alignItems: 'center', marginBottom: SPACING.md,
    borderWidth: 2, borderColor: COLORS.border },
  categoryCardSelected: { borderColor: COLORS.primary, backgroundColor: COLORS.primary + '10' },
  categoryEmoji: { fontSize: 40, marginBottom: SPACING.sm },
  categoryName: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, textAlign: 'center' },
  categoryAmount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  footer: { marginTop: SPACING.xl },
  selectedText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, textAlign: 'center', marginBottom: SPACING.md },
  button: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center' },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight }
});

export default CategoryScreen;
