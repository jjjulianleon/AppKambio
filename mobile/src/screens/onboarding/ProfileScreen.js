import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';
import { updateFinancialProfile } from '../../services/authService';

const SPENDING_PERSONALITIES = [
  { id: 'impulsivo', label: 'Comprador impulsivo', emoji: '🛍️' },
  { id: 'planificado', label: 'Planificador cuidadoso', emoji: '📋' },
  { id: 'social', label: 'Gastador social', emoji: '🎉' },
  { id: 'ahorrativo', label: 'Ahorrador natural', emoji: '🐷' }
];

const ProfileScreen = ({ navigation }) => {
  const [barrier, setBarrier] = useState('');
  const [motivation, setMotivation] = useState('');
  const [personality, setPersonality] = useState('');
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

  const handleContinue = async () => {
    if (!barrier.trim() || !motivation.trim() || !personality) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos para continuar');
      return;
    }

    setLoading(true);
    try {
      await updateFinancialProfile({
        savings_barrier: barrier,
        motivation,
        spending_personality: personality
      });
      navigation.navigate(ROUTES.TRANSACTIONS);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar tu perfil. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
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
            <Text style={styles.title}>Cuéntanos sobre ti</Text>
            <Text style={styles.subtitle}>
              Esto nos ayudará a personalizar tu experiencia de ahorro
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Qué te impide ahorrar?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ej: Gastos imprevistos, compras impulsivas, deudas..."
                  placeholderTextColor={COLORS.placeholder}
                  value={barrier}
                  onChangeText={setBarrier}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Qué te motiva a ahorrar?</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ej: Viajar, comprar una casa, seguridad financiera..."
                  placeholderTextColor={COLORS.placeholder}
                  value={motivation}
                  onChangeText={setMotivation}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Cómo describirías tu personalidad de gasto?</Text>
              <View style={styles.personalityGrid}>
                {SPENDING_PERSONALITIES.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={[
                      styles.personalityCard,
                      personality === item.id && styles.personalityCardSelected
                    ]}
                    onPress={() => setPersonality(item.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.personalityEmoji}>{item.emoji}</Text>
                    <Text style={[
                      styles.personalityLabel,
                      personality === item.id && styles.personalityLabelSelected
                    ]}>
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

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
              onPress={() => navigation.navigate(ROUTES.TRANSACTIONS)}
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
    marginBottom: SPACING.xl
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
  form: {
    flex: 1
  },
  inputGroup: {
    marginBottom: SPACING.xl
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  textArea: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500',
    minHeight: 100
  },
  personalityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs
  },
  personalityCard: {
    width: '48%',
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginHorizontal: '1%',
    marginBottom: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.sm
  },
  personalityCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10'
  },
  personalityEmoji: {
    fontSize: 32,
    marginBottom: SPACING.xs
  },
  personalityLabel: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center'
  },
  personalityLabelSelected: {
    color: COLORS.primary,
    fontWeight: '700'
  },
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginTop: SPACING.md,
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

export default ProfileScreen;
