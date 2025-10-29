import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES } from '../../utils/constants';
import { updateFinancialProfile } from '../../services/authService';

const ProfileScreen = ({ navigation }) => {
  const [barrier, setBarrier] = useState('');
  const [motivation, setMotivation] = useState('');
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    setLoading(true);
    try {
      await updateFinancialProfile({
        savings_barrier: barrier,
        motivation,
        spending_personality: 'general'
      });
      navigation.navigate(ROUTES.TRANSACTIONS);
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar tu perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Cuéntanos sobre ti</Text>
      <Text style={styles.subtitle}>Esto nos ayudará a personalizar tu experiencia</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>¿Qué te impide ahorrar?</Text>
        <TextInput style={styles.input} placeholder="Ej: Gastos imprevistos, compras impulsivas..."
          value={barrier} onChangeText={setBarrier} multiline numberOfLines={3} />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>¿Qué te motiva a ahorrar?</Text>
        <TextInput style={styles.input} placeholder="Ej: Viajar, comprar algo especial..."
          value={motivation} onChangeText={setMotivation} multiline numberOfLines={3} />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleContinue} disabled={loading}>
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.skipButton} onPress={() => navigation.navigate(ROUTES.TRANSACTIONS)}>
        <Text style={styles.skipText}>Saltar este paso</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xxl },
  inputGroup: { marginBottom: SPACING.xl },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border, borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.md, fontSize: FONT_SIZES.md, color: COLORS.text,
    textAlignVertical: 'top' },
  button: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', marginTop: SPACING.xl },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight },
  skipButton: { paddingVertical: SPACING.md, alignItems: 'center', marginTop: SPACING.md },
  skipText: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary }
});

export default ProfileScreen;
