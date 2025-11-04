import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Keyboard, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DEFAULT_KAMBIO_AMOUNT, SHADOWS } from '../../utils/constants';
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
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          ref={scrollViewRef}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Card */}
          <View style={styles.headerCard}>
            <Text style={styles.emoji}>💪</Text>
            <Text style={styles.title}>¡Hiciste un Kambio!</Text>
            <Text style={styles.subtitle}>Meta: {goal.name}</Text>
            <View style={styles.goalProgressInfo}>
              <Text style={styles.goalProgressLabel}>Progreso actual</Text>
              <Text style={styles.goalProgressAmount}>
                {formatCurrency(goal.current_amount || 0)} / {formatCurrency(goal.target_amount)}
              </Text>
            </View>
          </View>

          {/* Amount Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>¿Cuánto ahorraste? *</Text>
            <View style={styles.amountInputContainer}>
              <Text style={styles.currencySymbol}>$</Text>
              <TextInput
                style={styles.amountInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
                selectTextOnFocus
                placeholder="0.00"
                placeholderTextColor={COLORS.textSecondary}
              />
              {amount && parseFloat(amount) > 0 && (
                <TouchableOpacity
                  style={styles.confirmButton}
                  onPress={() => Keyboard.dismiss()}
                >
                  <Text style={styles.confirmButtonText}>✓</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Description Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Descripción (opcional)</Text>
            <View style={styles.descriptionContainer}>
              <TextInput
                ref={descriptionInputRef}
                style={styles.input}
                placeholder="Ej: Evité comprar café, preparé comida en casa..."
                placeholderTextColor={COLORS.textSecondary}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={3}
                maxLength={200}
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
              {description.length > 0 && (
                <TouchableOpacity
                  style={styles.confirmButtonDescription}
                  onPress={() => Keyboard.dismiss()}
                >
                  <Text style={styles.confirmButtonText}>✓</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={[styles.submitButton, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.textLight} />
            ) : (
              <Text style={styles.submitButtonText}>✨ Registrar Kambio</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => navigation.goBack()}
            disabled={loading}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </ScrollView>

        <CelebrationModal
          visible={showCelebration}
          onClose={handleCloseCelebration}
          title={celebrationData.type === 'goal' ? '¡Meta Completada!' : '¡Excelente!'}
          message={celebrationData.message}
          type={celebrationData.type}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.md,
    paddingBottom: SPACING.xl
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md
  },
  emoji: {
    fontSize: 64,
    marginBottom: SPACING.sm
  },
  title: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    opacity: 0.9,
    marginBottom: SPACING.md
  },
  goalProgressInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginTop: SPACING.sm
  },
  goalProgressLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textLight,
    opacity: 0.85,
    textAlign: 'center',
    marginBottom: SPACING.xs / 2
  },
  goalProgressAmount: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textLight,
    textAlign: 'center'
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    ...SHADOWS.sm
  },
  cardTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm
  },
  currencySymbol: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginRight: SPACING.sm
  },
  amountInput: {
    flex: 1,
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    padding: 0
  },
  confirmButton: {
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.round,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center'
  },
  confirmButtonText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textLight,
    fontWeight: 'bold'
  },
  descriptionContainer: {
    position: 'relative'
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    textAlignVertical: 'top',
    minHeight: 80,
    paddingRight: 50
  },
  confirmButtonDescription: {
    position: 'absolute',
    right: SPACING.sm,
    bottom: SPACING.sm,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.round,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center'
  },
  charCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'right',
    marginTop: SPACING.xs
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    marginTop: SPACING.sm,
    ...SHADOWS.md
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6
  },
  submitButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textLight
  },
  cancelButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  cancelButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500'
  }
});

export default KambioScreen;
