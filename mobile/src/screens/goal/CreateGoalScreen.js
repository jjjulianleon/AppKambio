import React, { useState } from 'react';
import {
  View, Text, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, MIN_GOAL_AMOUNT,
  MAX_GOAL_NAME_LENGTH, SHADOWS } from '../../utils/constants';
import { createGoal } from '../../services/goalService';
import { markOnboardingCompleted } from '../../services/authService';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { haptics } from '../../utils/haptics';

const CreateGoalScreen = ({ navigation, route }) => {
  const toast = useToast();
  const isOnboarding = route?.params?.isOnboarding || false;
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [nameError, setNameError] = useState('');
  const [amountError, setAmountError] = useState('');

  const handleCreate = async () => {
    // Clear previous errors
    setNameError('');
    setAmountError('');

    // Validations
    if (!name.trim()) {
      await haptics.error();
      setNameError('El nombre es requerido');
      toast.error('Por favor ingresa un nombre para tu meta');
      return;
    }

    if (name.length > MAX_GOAL_NAME_LENGTH) {
      await haptics.error();
      setNameError(`Máximo ${MAX_GOAL_NAME_LENGTH} caracteres`);
      toast.error(`El nombre no puede tener más de ${MAX_GOAL_NAME_LENGTH} caracteres`);
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount < MIN_GOAL_AMOUNT) {
      await haptics.error();
      setAmountError(`Mínimo $${MIN_GOAL_AMOUNT}`);
      toast.error(`El monto debe ser al menos $${MIN_GOAL_AMOUNT}`);
      return;
    }

    await haptics.medium();
    setLoading(true);
    try {
      await createGoal({
        name: name.trim(),
        target_amount: amount
      });

      await haptics.celebrate();
      toast.success('¡Meta creada exitosamente!');

      if (isOnboarding) {
        await markOnboardingCompleted();
        setTimeout(() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'MainTabs' }]
          });
        }, 1000);
      } else {
        setTimeout(() => {
          navigation.goBack();
        }, 1000);
      }
    } catch (error) {
      await haptics.error();
      toast.error(error.message || 'No se pudo crear la meta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {isOnboarding && (
          <View style={styles.onboardingHeader}>
            <Text style={styles.onboardingTitle}>¡Última paso!</Text>
            <Text style={styles.onboardingText}>Define tu primera meta de ahorro</Text>
          </View>
        )}

        <View style={styles.form}>
          <Input
            label="¿Qué quieres lograr?"
            value={name}
            onChangeText={(text) => {
              setName(text);
              setNameError('');
            }}
            placeholder="Ej: Viaje a la playa, Nueva laptop..."
            maxLength={MAX_GOAL_NAME_LENGTH}
            showCharacterCount
            error={nameError}
            leftIcon="🎯"
            showClearButton
          />

          <View style={styles.amountSection}>
            <Text style={styles.label}>¿Cuánto necesitas?</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <Input
                value={targetAmount}
                onChangeText={(text) => {
                  setTargetAmount(text);
                  setAmountError('');
                }}
                placeholder="100.00"
                keyboardType="decimal-pad"
                error={amountError}
                style={styles.amountInputField}
              />
            </View>
            <Text style={styles.hint}>Monto mínimo: ${MIN_GOAL_AMOUNT}</Text>
          </View>

          <Button
            title={isOnboarding ? '🚀 Comenzar mi viaje' : '✨ Crear meta'}
            onPress={handleCreate}
            loading={loading}
            disabled={loading}
            variant="primary"
            size="large"
            fullWidth
            hapticFeedback="medium"
            style={{ marginTop: SPACING.xl }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight
  },
  scrollContent: {
    flexGrow: 1,
    padding: SPACING.xl,
    paddingBottom: SPACING.xxxl
  },
  onboardingHeader: {
    marginTop: SPACING.xl,
    marginBottom: SPACING.xxl,
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md
  },
  onboardingTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.sm,
    letterSpacing: -0.5
  },
  onboardingText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.5
  },
  form: {
    flex: 1
  },
  label: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  amountSection: {
    marginTop: SPACING.xl
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm
  },
  currencySymbol: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.primary
  },
  amountInputField: {
    flex: 1
  },
  hint: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
    fontStyle: 'italic'
  }
});

export default CreateGoalScreen;
