import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
  Animated,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { createBulkTransactions } from '../../services/transactionService';
import { formatCurrency } from '../../utils/helpers';

const EXPENSE_CATEGORIES = [
  { id: 'cafe', label: 'Café ☕', emoji: '☕' },
  { id: 'comida', label: 'Comida 🍔', emoji: '🍔' },
  { id: 'transporte', label: 'Transporte 🚕', emoji: '🚕' },
  { id: 'entretenimiento', label: 'Entretenimiento 🎬', emoji: '🎬' },
  { id: 'compras', label: 'Compras 🛍️', emoji: '🛍️' },
  { id: 'delivery', label: 'Delivery 📦', emoji: '📦' },
  { id: 'suscripciones', label: 'Suscripciones 📱', emoji: '📱' },
  { id: 'otros', label: 'Otros 💳', emoji: '💳' }
];

const TransactionsScreen = ({ navigation }) => {
  const [transactions, setTransactions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

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

  const handleAddTransaction = () => {
    if (!description.trim() || !amount.trim() || !selectedCategory) {
      Alert.alert('Campos incompletos', 'Por favor completa todos los campos');
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      Alert.alert('Monto inválido', 'Por favor ingresa un monto válido');
      return;
    }

    const newTransaction = {
      id: Date.now().toString(),
      description: description.trim(),
      amount: parsedAmount,
      category: selectedCategory,
      transaction_date: date
    };

    setTransactions([...transactions, newTransaction]);

    // Reset form
    setDescription('');
    setAmount('');
    setSelectedCategory('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowModal(false);
  };

  const handleDeleteTransaction = (id) => {
    Alert.alert(
      'Eliminar transacción',
      '¿Estás seguro de eliminar esta transacción?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => setTransactions(transactions.filter(t => t.id !== id))
        }
      ]
    );
  };

  const handleContinue = async () => {
    if (transactions.length < 10) {
      Alert.alert(
        'Transacciones insuficientes',
        `Por favor agrega al menos 10 transacciones. Actualmente tienes ${transactions.length}.`
      );
      return;
    }

    setLoading(true);
    try {
      await createBulkTransactions(transactions);
      navigation.navigate(ROUTES.CATEGORIES);
    } catch (error) {
      Alert.alert('Error', 'No se pudieron guardar las transacciones. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryLabel = (categoryId) => {
    const category = EXPENSE_CATEGORIES.find(c => c.id === categoryId);
    return category ? category.label : categoryId;
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
            <Text style={styles.title}>Tus gastos recientes</Text>
            <Text style={styles.subtitle}>
              Ingresa tus últimas 10 transacciones para entender mejor tus hábitos de gasto
            </Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressText}>
              {transactions.length} / 10 transacciones agregadas
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${Math.min((transactions.length / 10) * 100, 100)}%` }
                ]}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowModal(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.addButtonText}>+ Agregar transacción</Text>
          </TouchableOpacity>

          {transactions.length > 0 && (
            <View style={styles.transactionsList}>
              <Text style={styles.listTitle}>Transacciones agregadas</Text>
              {transactions.map((transaction) => (
                <View key={transaction.id} style={styles.transactionCard}>
                  <View style={styles.transactionLeft}>
                    <Text style={styles.transactionCategory}>
                      {getCategoryLabel(transaction.category)}
                    </Text>
                    <Text style={styles.transactionDescription}>
                      {transaction.description}
                    </Text>
                    <Text style={styles.transactionDate}>
                      {new Date(transaction.transaction_date).toLocaleDateString('es-EC')}
                    </Text>
                  </View>
                  <View style={styles.transactionRight}>
                    <Text style={styles.transactionAmount}>
                      {formatCurrency(transaction.amount)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => handleDeleteTransaction(transaction.id)}
                      style={styles.deleteButton}
                    >
                      <Text style={styles.deleteButtonText}>Eliminar</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          )}

          {transactions.length >= 10 && (
            <TouchableOpacity
              style={[styles.continueButton, loading && styles.buttonDisabled]}
              onPress={handleContinue}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <ActivityIndicator color={COLORS.textLight} />
              ) : (
                <Text style={styles.continueButtonText}>Continuar</Text>
              )}
            </TouchableOpacity>
          )}

          {transactions.length < 10 && transactions.length > 0 && (
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => navigation.navigate(ROUTES.CATEGORIES)}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Saltar este paso</Text>
            </TouchableOpacity>
          )}
        </Animated.View>
      </ScrollView>

      {/* Add Transaction Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Nueva transacción</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Descripción</Text>
              <TextInput
                style={styles.input}
                placeholder="Ej: Almuerzo en restaurante"
                placeholderTextColor={COLORS.placeholder}
                value={description}
                onChangeText={setDescription}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Monto (USD)</Text>
              <TextInput
                style={styles.input}
                placeholder="0.00"
                placeholderTextColor={COLORS.placeholder}
                value={amount}
                onChangeText={setAmount}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Categoría</Text>
              <View style={styles.categoryGrid}>
                {EXPENSE_CATEGORIES.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={[
                      styles.categoryChip,
                      selectedCategory === cat.id && styles.categoryChipSelected
                    ]}
                    onPress={() => setSelectedCategory(cat.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.categoryChipText,
                      selectedCategory === cat.id && styles.categoryChipTextSelected
                    ]}>
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowModal(false)}
                activeOpacity={0.7}
              >
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalAddButton}
                onPress={handleAddTransaction}
                activeOpacity={0.8}
              >
                <Text style={styles.modalAddText}>Agregar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  progressCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    ...SHADOWS.sm
  },
  progressText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  progressBar: {
    height: 8,
    backgroundColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.sm,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
    ...SHADOWS.md
  },
  addButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  },
  transactionsList: {
    marginBottom: SPACING.xl
  },
  listTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.md
  },
  transactionCard: {
    backgroundColor: COLORS.surface,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...SHADOWS.sm
  },
  transactionLeft: {
    flex: 1
  },
  transactionCategory: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginBottom: SPACING.xs
  },
  transactionDescription: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  transactionDate: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  transactionRight: {
    alignItems: 'flex-end'
  },
  transactionAmount: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  deleteButton: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs
  },
  deleteButtonText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.error,
    fontWeight: '600'
  },
  continueButton: {
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
  continueButtonText: {
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
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  modalContent: {
    backgroundColor: COLORS.backgroundLight,
    borderTopLeftRadius: BORDER_RADIUS.xxl,
    borderTopRightRadius: BORDER_RADIUS.xxl,
    padding: SPACING.xl,
    paddingBottom: Platform.OS === 'ios' ? SPACING.xxl * 2 : SPACING.xl
  },
  modalTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xl
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
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500'
  },
  categoryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs
  },
  categoryChip: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    margin: SPACING.xs
  },
  categoryChipSelected: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight + '10'
  },
  categoryChipText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.text
  },
  categoryChipTextSelected: {
    color: COLORS.primary
  },
  modalButtons: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.borderLight
  },
  modalCancelText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.text
  },
  modalAddButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    ...SHADOWS.md
  },
  modalAddText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  }
});

export default TransactionsScreen;
