import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, SHADOWS } from '../../utils/constants';
import { isValidEmail } from '../../utils/helpers';
import api from '../../services/api';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { haptics } from '../../utils/haptics';

const ForgotPasswordScreen = ({ navigation }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [newPasswordError, setNewPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

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

  const handleResetPassword = async () => {
    // Clear previous errors
    setEmailError('');
    setNewPasswordError('');
    setConfirmPasswordError('');

    // Validations
    if (!email || !newPassword || !confirmPassword) {
      await haptics.error();
      if (!email) setEmailError('El email es requerido');
      if (!newPassword) setNewPasswordError('La contraseña es requerida');
      if (!confirmPassword) setConfirmPasswordError('Confirma tu contraseña');
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      await haptics.error();
      setEmailError('Email inválido');
      toast.error('Por favor ingresa un email válido');
      return;
    }

    if (newPassword.length < 6) {
      await haptics.error();
      setNewPasswordError('Mínimo 6 caracteres');
      toast.error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      await haptics.error();
      setConfirmPasswordError('Las contraseñas no coinciden');
      toast.error('Las contraseñas no coinciden');
      return;
    }

    await haptics.medium();
    setLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: email.toLowerCase().trim(),
        new_password: newPassword
      });

      await haptics.success();
      toast.success('¡Contraseña actualizada exitosamente!');

      setTimeout(() => {
        navigation.navigate('Login');
      }, 1500);
    } catch (error) {
      await haptics.error();

      let errorMessage = 'No se pudo actualizar la contraseña. Por favor intenta nuevamente.';

      if (error.message) {
        errorMessage = error.message;

        if (error.message.includes('No existe una cuenta con este email')) {
          errorMessage = 'No existe una cuenta registrada con este email';
          setEmailError('Email no encontrado');
        } else if (error.message.includes('Network request failed') || error.isNetworkError) {
          errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet';
        }
      }

      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Animated.View
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <View style={styles.header}>
              <Text style={styles.title}>Restablecer contraseña</Text>
              <Text style={styles.subtitle}>
                Ingresa tu email y tu nueva contraseña
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError('');
                }}
                placeholder="tu@email.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
                leftIcon="📧"
                showClearButton
              />

              <Input
                label="Nueva contraseña"
                value={newPassword}
                onChangeText={(text) => {
                  setNewPassword(text);
                  setNewPasswordError('');
                }}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                error={newPasswordError}
                leftIcon="🔒"
                style={{ marginTop: SPACING.md }}
              />

              <Input
                label="Confirmar contraseña"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  setConfirmPasswordError('');
                }}
                placeholder="Repite tu contraseña"
                secureTextEntry
                error={confirmPasswordError}
                leftIcon="🔐"
                style={{ marginTop: SPACING.md }}
              />

              <Button
                title="Actualizar contraseña"
                onPress={handleResetPassword}
                loading={loading}
                disabled={loading}
                variant="primary"
                size="large"
                fullWidth
                hapticFeedback="medium"
                icon="✓"
                iconPosition="right"
                style={{ marginTop: SPACING.lg }}
              />

              <Button
                title="← Volver a Login"
                onPress={() => {
                  haptics.light();
                  navigation.goBack();
                }}
                variant="ghost"
                size="medium"
                fullWidth
                hapticFeedback="light"
                style={{ marginTop: SPACING.md }}
                textStyle={{ color: COLORS.primary, fontWeight: '700' }}
              />
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight
  },
  keyboardView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.xl
  },
  content: {
    flex: 1
  },
  header: {
    marginTop: 0,
    marginBottom: SPACING.lg
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: SPACING.xs,
    letterSpacing: -0.5
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.5,
    marginTop: SPACING.xs
  },
  form: {
    flex: 1
  }
});

export default ForgotPasswordScreen;
