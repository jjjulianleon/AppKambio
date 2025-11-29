import React, { useState, useRef } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Keyboard, KeyboardAvoidingView,
  Platform, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, DEFAULT_KAMBIO_AMOUNT, SHADOWS } from '../../utils/constants';
import { createKambio } from '../../services/goalService';
import CelebrationModal from '../../components/CelebrationModal';
import { formatCurrency } from '../../utils/helpers';
import { haptics } from '../../utils/haptics';
import { useToast } from '../../contexts/ToastContext';
import { Button } from '../../components/ui';

const KambioScreen = ({ navigation, route }) => {
  const toast = useToast();
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
      haptics.error();
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    // Haptic feedback on button press
    await haptics.medium();

    setLoading(true);
    try {
      // NEW: No goal_id needed - goes to general savings
      const result = await createKambio({
        amount: amountValue,
        description: description.trim() || 'Ahorro registrado'
      });

      // Kambio registered to general savings pool
      await haptics.success();

      const goalsReady = result.savings_updated?.goals_ready_to_complete || 0;
      const totalSaved = result.savings_updated?.total_saved || 0;

      let message = `¡Sumaste ${formatCurrency(amountValue)} a tu ahorro general!`;
      if (goalsReady > 0) {
        message += `\n\nTienes ${goalsReady} meta${goalsReady > 1 ? 's' : ''} lista${goalsReady > 1 ? 's' : ''} para completar.`;
      }

      setCelebrationData({
        type: 'kambio',
        message
      });

      setShowCelebration(true);
    } catch (error) {
      await haptics.error();
      toast.error(error.message || 'No se pudo registrar el Kambio');
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
            <Text style={styles.subtitle}>Ahorro General</Text>
            <View style={styles.goalProgressInfo}>
              <Text style={styles.goalProgressLabel}>Todas tus metas avanzan juntas</Text>
              <Text style={styles.goalProgressAmount}>
                Ahorra para desbloquear metas
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
                  onPress={() => {
                    haptics.light();
                    Keyboard.dismiss();
                  }}
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
                  onPress={() => {
                    haptics.light();
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={styles.confirmButtonText}>✓</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.charCount}>{description.length}/200</Text>
          </View>

          {/* Action Buttons */}
          <Button
            title="Registrar Kambio"
            onPress={handleSubmit}
            loading={loading}
            disabled={loading}
            variant="primary"
            size="large"
            icon="✨"
            iconPosition="left"
            fullWidth
            hapticFeedback="medium"
          />

          <Button
            title="Cancelar"
            onPress={() => {
              haptics.light();
              navigation.goBack();
            }}
            disabled={loading}
            variant="ghost"
            size="large"
            fullWidth
            hapticFeedback="light"
            style={styles.cancelButton}
          />
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
    paddingBottom: 100
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
