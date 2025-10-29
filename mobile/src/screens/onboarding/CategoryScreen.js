import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import api from '../../services/api';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, PREDEFINED_CATEGORIES, SHADOWS } from '../../utils/constants';

const CategoryScreen = ({ navigation }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  const toggleCategory = (category) => {
    if (selectedCategories.find(c => c.id === category.id)) {
      setSelectedCategories(selectedCategories.filter(c => c.id !== category.id));
    } else {
      if (selectedCategories.length < 2) {
        setSelectedCategories([...selectedCategories, category]);
      } else {
        Alert.alert('Límite alcanzado', 'Puedes seleccionar máximo 2 categorías de gastos hormiga');
      }
    }
  };

  const handleContinue = async () => {
    if (selectedCategories.length === 0) {
      Alert.alert(
        'Selecciona una categoría',
        'Elige al menos 1 gasto hormiga que quieras reducir para continuar'
      );
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
      Alert.alert('Error', 'No se pudieron guardar las categorías. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = () => {
    navigation.navigate(ROUTES.CREATE_GOAL, { isOnboarding: true });
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          style={{
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }}
        >
          <View style={styles.header}>
            <Text style={styles.title}>Gastos Hormiga</Text>
            <Text style={styles.subtitle}>
              Selecciona 1 o 2 categorías de gastos pequeños pero frecuentes que quieras reducir
            </Text>
          </View>

          <View style={styles.infoBox}>
            <Text style={styles.infoIcon}>💡</Text>
            <Text style={styles.infoText}>
              Los gastos hormiga son pequeños montos que parecen insignificantes, pero que sumados pueden
              representar una gran parte de tu presupuesto
            </Text>
          </View>

          <View style={styles.categoriesGrid}>
            {PREDEFINED_CATEGORIES.map(category => {
              const isSelected = selectedCategories.find(c => c.id === category.id);
              return (
                <TouchableOpacity
                  key={category.id}
                  style={[styles.categoryCard, isSelected && styles.categoryCardSelected]}
                  onPress={() => toggleCategory(category)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.categoryEmoji}>{category.emoji}</Text>
                  <Text style={[
                    styles.categoryName,
                    isSelected && styles.categoryNameSelected
                  ]}>
                    {category.name}
                  </Text>
                  <Text style={[
                    styles.categoryAmount,
                    isSelected && styles.categoryAmountSelected
                  ]}>
                    ~${category.defaultAmount}
                  </Text>
                  {isSelected && (
                    <View style={styles.selectedBadge}>
                      <Text style={styles.selectedBadgeText}>✓</Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Text style={styles.selectedText}>
              {selectedCategories.length} de 2 categorías seleccionadas
            </Text>

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textLight} />
              ) : (
                <Text style={styles.buttonText}>Continuar</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.skipButton}
              onPress={handleSkip}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Saltar este paso</Text>
            </TouchableOpacity>
          </View>
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
  content: {
    padding: SPACING.xl,
    paddingBottom: SPACING.xxl
  },
  header: {
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.5
  },
  infoBox: {
    backgroundColor: COLORS.primaryLight + '15',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.xl,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  infoIcon: {
    fontSize: 24,
    marginRight: SPACING.sm
  },
  infoText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.text,
    lineHeight: FONT_SIZES.sm * 1.5
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs
  },
  categoryCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginHorizontal: '1%',
    marginBottom: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    position: 'relative',
    ...SHADOWS.sm
  },
  categoryCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10'
  },
  categoryEmoji: {
    fontSize: 48,
    marginBottom: SPACING.sm
  },
  categoryName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: SPACING.xs
  },
  categoryNameSelected: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  categoryAmount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  categoryAmountSelected: {
    color: COLORS.primary,
    fontWeight: '600'
  },
  selectedBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.primary,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center'
  },
  selectedBadgeText: {
    color: COLORS.textLight,
    fontSize: 14,
    fontWeight: '700'
  },
  footer: {
    marginTop: SPACING.xl
  },
  selectedText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    fontWeight: '600'
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    ...SHADOWS.none
  },
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  },
  skipButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md
  },
  skipText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600'
  }
});

export default CategoryScreen;
