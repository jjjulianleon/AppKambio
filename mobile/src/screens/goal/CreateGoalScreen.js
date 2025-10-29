import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, MIN_GOAL_AMOUNT,
  MAX_GOAL_NAME_LENGTH } from '../../utils/constants';
import { createGoal } from '../../services/goalService';
import { markOnboardingCompleted } from '../../services/authService';

const CreateGoalScreen = ({ navigation, route }) => {
  const isOnboarding = route?.params?.isOnboarding || false;
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Por favor ingresa un nombre para tu meta');
      return;
    }

    if (name.length > MAX_GOAL_NAME_LENGTH) {
      Alert.alert('Error', `El nombre no puede tener más de ${MAX_GOAL_NAME_LENGTH} caracteres`);
      return;
    }

    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount < MIN_GOAL_AMOUNT) {
      Alert.alert('Error', `El monto debe ser al menos $${MIN_GOAL_AMOUNT}`);
      return;
    }

    setLoading(true);
    try {
      await createGoal({
        name: name.trim(),
        target_amount: amount
      });

      if (isOnboarding) {
        await markOnboardingCompleted();
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
      } else {
        Alert.alert('¡Éxito!', 'Meta creada correctamente', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la meta');
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
          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Qué quieres lograr?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej: Viaje a la playa, Nueva laptop..."
              value={name}
              onChangeText={setName}
              maxLength={MAX_GOAL_NAME_LENGTH}
            />
            <Text style={styles.charCount}>{name.length}/{MAX_GOAL_NAME_LENGTH}</Text>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Cuánto necesitas?</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                placeholder="100.00"
                value={targetAmount}
                onChangeText={setTargetAmount}
                keyboardType="decimal-pad"
              />
            </View>
            <Text style={styles.hint}>Monto mínimo: ${MIN_GOAL_AMOUNT}</Text>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleCreate}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textLight} />
            ) : (
              <Text style={styles.buttonText}>
                {isOnboarding ? 'Comenzar mi viaje' : 'Crear meta'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  onboardingHeader: { marginTop: SPACING.xl, marginBottom: SPACING.xxl },
  onboardingTitle: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  onboardingText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary },
  form: { flex: 1 },
  inputGroup: { marginBottom: SPACING.xl },
  label: { fontSize: FONT_SIZES.lg, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.md },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.text },
  charCount: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs, textAlign: 'right' },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md },
  currencySymbol: { fontSize: FONT_SIZES.xl, fontWeight: 'bold', color: COLORS.primary, marginRight: SPACING.sm },
  amountInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.xl, color: COLORS.text },
  hint: { fontSize: FONT_SIZES.sm, color: COLORS.textSecondary, marginTop: SPACING.xs },
  button: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', marginTop: SPACING.xl },
  buttonDisabled: { backgroundColor: COLORS.disabled },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight }
});

export default CreateGoalScreen;
