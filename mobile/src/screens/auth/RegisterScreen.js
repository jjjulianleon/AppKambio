import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, Alert, ActivityIndicator, ScrollView
} from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES } from '../../utils/constants';
import { register } from '../../services/authService';
import { isValidEmail, validatePassword } from '../../utils/helpers';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!fullName || !email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Por favor ingresa un email válido');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      Alert.alert('Error', passwordValidation.message);
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName);
      navigation.reset({
        index: 0,
        routes: [{ name: ROUTES.PROFILE }]
      });
    } catch (error) {
      Alert.alert('Error', error.message || 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput style={styles.input} placeholder="Juan Pérez" value={fullName}
              onChangeText={setFullName} autoCapitalize="words" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} placeholder="tu@email.com" value={email}
              onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput style={styles.input} placeholder="Mínimo 6 caracteres" value={password}
              onChangeText={setPassword} secureTextEntry />
          </View>

          <TouchableOpacity style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color={COLORS.textLight} /> :
              <Text style={styles.buttonText}>Crear cuenta</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: SPACING.xl },
  form: { flex: 1, marginTop: SPACING.xl },
  inputGroup: { marginBottom: SPACING.lg },
  label: { fontSize: FONT_SIZES.md, fontWeight: '600', color: COLORS.text, marginBottom: SPACING.sm },
  input: { backgroundColor: COLORS.surface, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.md,
    fontSize: FONT_SIZES.md, color: COLORS.text },
  button: { backgroundColor: COLORS.primary, paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl, alignItems: 'center', marginTop: SPACING.md },
  buttonDisabled: { backgroundColor: COLORS.disabled },
  buttonText: { fontSize: FONT_SIZES.lg, fontWeight: 'bold', color: COLORS.textLight }
});

export default RegisterScreen;
