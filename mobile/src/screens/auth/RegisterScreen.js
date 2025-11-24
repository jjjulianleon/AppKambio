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
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';
import { register } from '../../services/authService';
import { isValidEmail, validatePassword } from '../../utils/helpers';
import RocketAnimation from '../../components/RocketAnimation';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { haptics } from '../../utils/haptics';

const RegisterScreen = ({ navigation }) => {
  const toast = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);
  const [fullNameError, setFullNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');

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

  const handleRegister = async () => {
    // Clear previous errors
    setFullNameError('');
    setEmailError('');
    setPasswordError('');

    // Validation
    if (!fullName || !email || !password) {
      await haptics.error();
      if (!fullName) setFullNameError('El nombre es requerido');
      if (!email) setEmailError('El email es requerido');
      if (!password) setPasswordError('La contraseña es requerida');
      toast.error('Por favor completa todos los campos');
      return;
    }

    if (!isValidEmail(email)) {
      await haptics.error();
      setEmailError('Email inválido');
      toast.error('Por favor ingresa un email válido');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      await haptics.error();
      setPasswordError(passwordValidation.message);
      toast.error(passwordValidation.message);
      return;
    }

    await haptics.medium();
    setLoading(true);
    try {
      await register(email, password, fullName);

      await haptics.celebrate();
      toast.success('¡Cuenta creada exitosamente!');

      // Show rocket animation on successful registration
      setShowRocketAnimation(true);
      setLoading(false);

      // Wait for animation to complete before navigating
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: ROUTES.PROFILE }]
        });
      }, 2000);
    } catch (error) {
      await haptics.error();

      let errorMessage = 'No se pudo crear la cuenta. Por favor intenta nuevamente.';

      if (error.message && error.message.includes('ya existe')) {
        errorMessage = 'Este email ya está registrado. Por favor usa otro email o inicia sesión';
        setEmailError('Email ya registrado');
      } else if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet';
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast.error(errorMessage);
      setLoading(false);
      setShowRocketAnimation(false);
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
              <Text style={styles.title}>Crea tu cuenta</Text>
              <Text style={styles.subtitle}>
                Empieza tu viaje hacia el ahorro inteligente
              </Text>
            </View>

            <View style={styles.form}>
              <Input
                label="Nombre completo"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setFullNameError('');
                }}
                placeholder="Juan Pérez"
                autoCapitalize="words"
                error={fullNameError}
                leftIcon="👤"
                showClearButton
              />

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
                style={{ marginTop: SPACING.md }}
              />

              <Input
                label="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                placeholder="Mínimo 6 caracteres"
                secureTextEntry
                error={passwordError}
                leftIcon="🔒"
                style={{ marginTop: SPACING.md }}
              />

              <Button
                title="Crear cuenta"
                onPress={handleRegister}
                loading={loading}
                disabled={loading}
                variant="primary"
                size="large"
                fullWidth
                hapticFeedback="medium"
                icon="🚀"
                iconPosition="right"
                style={{ marginTop: SPACING.lg }}
              />

              <Button
                title="¿Ya tienes cuenta? Inicia sesión"
                onPress={() => {
                  haptics.light();
                  navigation.navigate(ROUTES.LOGIN);
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

      {/* Rocket Animation on Successful Registration */}
      {showRocketAnimation && (
        <RocketAnimation
          duration={2000}
          onAnimationComplete={() => setShowRocketAnimation(false)}
        />
      )}
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

export default RegisterScreen;
