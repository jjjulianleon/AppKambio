import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES } from '../../utils/constants';

const TransactionsScreen = ({ navigation }) => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Tus transacciones</Text>
      <Text style={styles.subtitle}>
        En el MVP, simulamos tu historial. En producción, conectaremos con tu banco.
      </Text>

      <View style={styles.infoBox}>
        <Text style={styles.infoEmoji}>💳</Text>
        <Text style={styles.infoText}>
          Hemos preparado un historial simulado de transacciones para que puedas probar Kambio
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate(ROUTES.CATEGORIES)}
      >
        <Text style={styles.buttonText}>Continuar</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: SPACING.xl, flex: 1 },
  title: { fontSize: FONT_SIZES.xxxl, fontWeight: 'bold', color: COLORS.text, marginBottom: SPACING.sm },
  subtitle: { fontSize: FONT_SIZES.md, color: COLORS.textSecondary, marginBottom: SPACING.xxl },
  infoBox: { backgroundColor: COLORS.primary + '10', padding: SPACING.lg, borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center', marginBottom: SPACING.xxl },
  infoEmoji: { fontSize: 60, marginBottom: SPACING.md },
  infoText: { fontSize: FONT_SIZES.md, color: COLORS.text, textAlign: 'center', lineHeight: 22 },
  button: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md, borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center', marginTop: 'auto' },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight }
});

export default TransactionsScreen;
