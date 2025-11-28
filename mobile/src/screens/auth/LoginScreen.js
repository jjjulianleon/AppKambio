import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';
import { login } from '../../services/authService';
import { isValidEmail } from '../../utils/helpers';
import { isBiometricAvailable, getBiometricType, getBiometricTypeName } from '../../services/biometricService';
import { saveCredentialsForBiometric, isBiometricSetup } from '../../services/secureCredentialService';
import { Input, Button } from '../../components/ui';
import { useToast } from '../../contexts/ToastContext';
import { haptics } from '../../utils/haptics';

const LoginScreen = ({ navigation }) => {
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
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

  const handleLogin = async () => {
    // Clear previous errors
    setEmailError('');
    setPasswordError('');

    // Validation
    if (!email || !password) {
      await haptics.error();
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

    await haptics.medium();
    setLoading(true);
    try {
      const response = await login(email, password);

      await haptics.success();

      // Check if we should prompt for biometric setup
      const biometricAvailable = await isBiometricAvailable();
      const biometricAlreadySetup = await isBiometricSetup();

      if (biometricAvailable && !biometricAlreadySetup) {
        // Prompt user to enable biometric authentication
        const biometricType = await getBiometricType();
        const biometricName = getBiometricTypeName(biometricType);

        toast.info(`${biometricName} disponible para inicio rápido`, 3000);

        // Note: We'll keep Alert for the biometric prompt as it requires user choice
        setTimeout(() => {
          Alert.alert(
            'Habilitar autenticación biométrica',
            `¿Deseas usar ${biometricName} para iniciar sesión más rápido la próxima vez?`,
            [
              {
                text: 'Ahora no',
                style: 'cancel',
                onPress: () => {
                  haptics.light();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }]
                  });
                }
              },
              {
                text: 'Sí, habilitar',
                onPress: async () => {
                  await haptics.success();
                  const saved = await saveCredentialsForBiometric(email, password);
                  if (saved) {
                    toast.success(`${biometricName} habilitado exitosamente`);
                  }
                  navigation.reset({
                    index: 0,
                    routes: [{ name: 'MainTabs' }]
                  });
                }
              }
            ]
          );
        }, 500);
      } else if (biometricAvailable && biometricAlreadySetup) {
        // Update credentials for existing biometric user
        await saveCredentialsForBiometric(email, password);
        toast.success('¡Bienvenido de vuelta!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
      } else {
        // Navigate to Profile/Dashboard based on onboarding status
        toast.success('¡Bienvenido de vuelta!');
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
      }
    } catch (error) {
      await haptics.error();

      let errorMessage = 'No se pudo iniciar sesión. Por favor intenta nuevamente.';

      if (error.message && error.message.includes('Email o contraseña incorrectos')) {
        errorMessage = 'El email o la contraseña no son correctos';
        setEmailError('Credenciales incorrectas');
        setPasswordError('Credenciales incorrectas');
      } else if (error.message && error.message.includes('Network request failed')) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet';
      } else if (error.isNetworkError) {
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet';
      } else if (error.message) {
        errorMessage = error.message;
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
              <Text style={styles.title}>Bienvenido de vuelta</Text>
              <Text style={styles.subtitle}>
                Ingresa para continuar tu camino de ahorro
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
                style={{ marginTop: SPACING.md }}
              />

              <Input
                label="Contraseña"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  setPasswordError('');
                }}
                placeholder="••••••••"
                secureTextEntry
                textContentType="password"
                autoComplete="password"
                nativeID="password"
                error={passwordError}
                leftIcon="🔒"
                style={{ marginTop: SPACING.md }}
              />

              <Button
                title="Iniciar Sesión"
                onPress={handleLogin}
                loading={loading}
                disabled={loading}
                variant="primary"
                size="large"
                fullWidth
                hapticFeedback="medium"
                style={{ marginTop: SPACING.lg }}
              />

              <Button
                title="¿Olvidaste tu contraseña?"
                onPress={() => {
                  haptics.light();
                  navigation.navigate('ForgotPassword');
                }}
                variant="ghost"
                size="medium"
                fullWidth
                hapticFeedback="light"
                style={{ marginTop: SPACING.md }}
                textStyle={{ textDecorationLine: 'underline' }}
              />

              <Button
                title="¿No tienes cuenta? Regístrate"
                onPress={() => {
                  haptics.light();
                  navigation.navigate(ROUTES.REGISTER);
                }}
                variant="ghost"
                size="medium"
                fullWidth
                hapticFeedback="light"
                style={{ marginTop: SPACING.sm }}
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

export default LoginScreen;
