import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DEFAULT_KAMBIO_AMOUNT } from '../../utils/constants';
import { createKambio } from '../../services/goalService';
import CelebrationModal from '../../components/CelebrationModal';
import { formatCurrency } from '../../utils/helpers';

const KambioScreen = ({ navigation, route }) => {
  const { goal } = route.params;
  const [amount, setAmount] = useState(DEFAULT_KAMBIO_AMOUNT.toString());
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState({ type: 'kambio', message: '' });
  const scrollViewRef = useRef(null);
  const descriptionInputRef = useRef(null);

  const handleSubmit = async () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    try {
      const result = await createKambio({
        goal_id: goal.id,
        amount: amountValue,
        description: description.trim() || 'Ahorro registrado'
      });

      // Check if goal was completed
      const newAmount = (goal.current_amount || 0) + amountValue;
      const isGoalCompleted = newAmount >= goal.target_amount;

      if (isGoalCompleted) {
        setCelebrationData({
          type: 'goal',
          message: `¡Completaste tu meta "${goal.name}"! Has ahorrado ${formatCurrency(newAmount)} de ${formatCurrency(goal.target_amount)}`
        });
      } else {
        setCelebrationData({
          type: 'kambio',
          message: `Has sumado ${formatCurrency(amountValue)} a tu meta "${goal.name}"`
        });
      }

      setShowCelebration(true);
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo registrar el Kambio');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCelebration = () => {
    setShowCelebration(false);
    navigation.goBack();
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <Text style={styles.emoji}>💪</Text>
          <Text style={styles.title}>¡Hiciste un Kambio!</Text>
          <Text style={styles.subtitle}>Meta: {goal.name}</Text>

          <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>¿Cuánto ahorraste?</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                selectTextOnFocus
              />
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={() => Keyboard.dismiss()}
              >
                <Text style={styles.confirmButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Descripción (opcional)</Text>
            <View style={styles.descriptionContainer}>
              <TextInput
                ref={descriptionInputRef}
                style={styles.input}
                placeholder="Ej: Evité comprar café"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
              <TouchableOpacity
                style={styles.confirmButtonDescription}
                onPress={() => Keyboard.dismiss()}
              >
                <Text style={styles.confirmButtonText}>✓</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textLight} />
            ) : (
              <Text style={styles.buttonText}>Registrar Kambio</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </View>
      </ScrollView>

      <CelebrationModal
        visible={showCelebration}
        onClose={handleCloseCelebration}
        title={celebrationData.type === 'goal' ? '¡Meta Completada!' : '¡Excelente!'}
        message={celebrationData.message}
        type={celebrationData.type}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1 },
  content: { flex: 1, padding: SPACING.xl, alignItems: 'center' },
  emoji: { fontSize: 80, marginTop: SPACING.xxl },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginTop: SPACING.lg },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginTop: SPACING.sm, marginBottom: SPACING.xl },
  form: { width: '100%', marginTop: SPACING.xl },
  inputGroup: { marginBottom: SPACING.xl },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  amountInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: COLORS.surface,
    borderWidth: 2, borderColor: COLORS.primary, borderRadius: BORDER_RADIUS.lg, paddingHorizontal: SPACING.md },
  currencySymbol: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.primary, marginRight: SPACING.sm },
  amountInput: { flex: 1, paddingVertical: SPACING.md, fontSize: FONT_SIZES.xxxl, fontWeight: 'bold',
    color: COLORS.text, textAlign: 'center' },
  confirmButton: { backgroundColor: COLORS.primary, borderRadius: BORDER_RADIUS.round, width: 40, height: 40,
    justifyContent: 'center', alignItems: 'center', marginLeft: SPACING.sm },
  confirmButtonText: { fontSize: 24, color: COLORS.textLight, fontWeight: 'bold' },
  descriptionContainer: { position: 'relative' },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
    textAlignVertical: 'top', paddingRight: 50 },
  confirmButtonDescription: { position: 'absolute', right: SPACING.sm, bottom: SPACING.sm, backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.round, width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  button: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', marginTop: SPACING.md },
  buttonDisabled: { backgroundColor: COLORS.disabled },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight },
  cancelButton: { paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  cancelButtonText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary }
});

export default KambioScreen;
