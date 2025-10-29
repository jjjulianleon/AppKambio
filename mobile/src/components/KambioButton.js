import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES } from '../utils/constants';

const KambioButton = ({ onPress, loading = false, disabled = false, style }) => {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        disabled && styles.buttonDisabled,
        style
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.textLight} />
      ) : (
        <Text style={styles.buttonText}>💪 Hice un Kambio</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8
  },
  buttonDisabled: {
    backgroundColor: COLORS.disabled,
    elevation: 0,
    shadowOpacity: 0
  },
  buttonText: {
    color: COLORS.textLight,
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold'
  }
});

export default KambioButton;
