import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Keyboard
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, SHADOWS } from '../../utils/constants';
import { formatCurrency } from '../../utils/helpers';
import * as savingsPoolService from '../../services/savingsPoolService';

const CreateRequestScreen = ({ navigation, route }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userSavings, setUserSavings] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const descriptionInputRef = useRef(null);
  const scrollViewRef = useRef(null);

  useEffect(() => {
    loadUserSavings();
  }, []);

  const loadUserSavings = async () => {
    try {
      const poolData = await savingsPoolService.getPoolData();
      if (poolData && poolData.userSavings !== undefined) {
        setUserSavings(poolData.userSavings);
      }
    } catch (error) {
      console.error('Error loading user savings:', error);
      // Si falla, usar valor por defecto
      setUserSavings(0);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (text) => {
    // Solo permitir números y punto decimal
    const numericValue = text.replace(/[^0-9.]/g, '');
    
    // Evitar múltiples puntos decimales
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      return;
    }
    
    // Limitar a 2 decimales
    if (parts[1] && parts[1].length > 2) {
      return;
    }

    setAmount(numericValue);
  };

  const handleSubmit = async () => {
    // Validaciones
    const requestAmount = parseFloat(amount);

    if (!amount || isNaN(requestAmount) || requestAmount <= 0) {
      Alert.alert('Error', 'Por favor ingresa un monto válido');
      return;
    }

    if (requestAmount < 5) {
      Alert.alert('Monto muy bajo', 'El monto mínimo de solicitud es $5');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Descripción requerida', 'Por favor explica para qué necesitas la ayuda');
      return;
    }

    if (description.trim().length < 10) {
      Alert.alert('Descripción muy corta', 'Por favor proporciona más detalles (mínimo 10 caracteres)');
      return;
    }

    // Confirmación
    Alert.alert(
      'Confirmar Solicitud',
      `¿Deseas solicitar ${formatCurrency(requestAmount)} del pozo de ahorro?\n\n"${description.trim()}"\n\nTodos los miembros del pozo recibirán una notificación.`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Enviar Solicitud',
          onPress: submitRequest
        }
      ]
    );
  };

  const submitRequest = async () => {
    setIsSubmitting(true);

    try {
      // Crear solicitud en el API
      const response = await savingsPoolService.createRequest({
        amount: parseFloat(amount),
        description: description.trim()
      });

      if (response) {
        Alert.alert(
          '¡Solicitud Enviada!',
          'Tu solicitud ha sido enviada a todos los miembros del pozo. Te notificaremos cuando empiecen a contribuir.',
          [
            {
              text: 'OK',
              onPress: () => navigation.goBack()
            }
          ]
        );
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al crear solicitud:', error);
      Alert.alert('Error', 'No se pudo crear la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMaxRequestInfo = () => {
    const requestAmount = parseFloat(amount);
    if (requestAmount >= 5) {
      return { color: COLORS.success, text: '✓ Monto válido' };
    } else if (requestAmount > 0 && requestAmount < 5) {
      return { color: COLORS.error, text: '✗ Monto mínimo: $5' };
    }
    return { color: COLORS.textSecondary, text: '' };
  };

  const requestInfo = getMaxRequestInfo();

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container} edges={['bottom']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>💡 Cómo funciona</Text>
            <Text style={styles.infoText}>
              • Todos los miembros del pozo contribuirán de forma proporcional{'\n'}
              • Puedes solicitar cualquier monto que necesites{'\n'}
              • La contribución de cada miembro no puede exceder el 50% de sus ahorros
            </Text>
          </View>

          {/* Balance actual */}
          <View style={styles.balanceCard}>
            <Text style={styles.balanceLabel}>Tus Ahorros Actuales</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(userSavings)}</Text>
            <Text style={styles.balanceNote}>
              Los demás miembros te ayudarán a completar tu solicitud
            </Text>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto a solicitar *</Text>
              <View style={styles.amountInputContainer}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.amountInput}
                  placeholder="0.00"
                  placeholderTextColor={COLORS.placeholder}
                  value={amount}
                  onChangeText={handleAmountChange}
                  keyboardType="decimal-pad"
                  maxLength={8}
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
              {requestInfo.text !== '' && (
                <Text style={[styles.validationText, { color: requestInfo.color }]}>
                  {requestInfo.text}
                </Text>
              )}
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>¿Para qué necesitas la ayuda? *</Text>
              <TextInput
                ref={descriptionInputRef}
                style={styles.descriptionInput}
                placeholder="Ej: Emergencia médica, reparación de auto, gastos escolares..."
                placeholderTextColor={COLORS.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                maxLength={200}
                textAlignVertical="top"
                onFocus={() => {
                  setTimeout(() => {
                    scrollViewRef.current?.scrollToEnd({ animated: true });
                  }, 100);
                }}
              />
              <Text style={styles.characterCount}>
                {description.length}/200
              </Text>
            </View>
          </View>

          {/* Ejemplo de distribución */}
          {amount && parseFloat(amount) > 0 && (
            <View style={styles.exampleCard}>
              <Text style={styles.exampleTitle}>📊 Distribución Estimada</Text>
              <Text style={styles.exampleText}>
                Con 3 miembros en el pozo, cada uno contribuiría aproximadamente:
              </Text>
              <Text style={styles.exampleAmount}>
                {formatCurrency(parseFloat(amount) / 3)}
              </Text>
              <Text style={styles.exampleNote}>
                (La contribución final dependerá de los ahorros de cada miembro)
              </Text>
            </View>
          )}
        </ScrollView>

        {/* Botón de enviar */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[
              styles.submitButton,
              isSubmitting && styles.submitButtonDisabled
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    padding: SPACING.md
  },
  infoCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg
  },
  infoTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.sm
  },
  infoText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    lineHeight: 20
  },
  balanceCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    alignItems: 'center',
    ...SHADOWS.sm
  },
  balanceLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs
  },
  balanceAmount: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  balanceNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'center'
  },
  form: {
    marginBottom: SPACING.lg
  },
  inputGroup: {
    marginBottom: SPACING.lg
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    ...SHADOWS.sm
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
    position: 'absolute',
    right: SPACING.md,
    padding: SPACING.sm,
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
  validationText: {
    fontSize: FONT_SIZES.sm,
    marginTop: SPACING.sm,
    fontWeight: '500'
  },
  descriptionInput: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    minHeight: 100,
    ...SHADOWS.sm
  },
  characterCount: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    textAlign: 'right',
    marginTop: SPACING.xs
  },
  exampleCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm
  },
  exampleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  exampleText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm
  },
  exampleAmount: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.primary,
    textAlign: 'center',
    marginVertical: SPACING.sm
  },
  exampleNote: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textTertiary,
    fontStyle: 'italic',
    textAlign: 'center'
  },
  footer: {
    padding: SPACING.md,
    backgroundColor: COLORS.surface,
    borderTopWidth: 1,
    borderTopColor: COLORS.border
  },
  submitButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    alignItems: 'center',
    ...SHADOWS.md
  },
  submitButtonDisabled: {
    backgroundColor: COLORS.disabled,
    opacity: 0.6
  },
  submitButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textLight
  }
});

export default CreateRequestScreen;
