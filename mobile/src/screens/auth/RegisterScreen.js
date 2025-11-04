import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';
import { register } from '../../services/authService';
import { isValidEmail, validatePassword } from '../../utils/helpers';
import RocketAnimation from '../../components/RocketAnimation';

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showRocketAnimation, setShowRocketAnimation] = useState(false);

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
      // Manejo mejorado de errores (sin console.error)
      let errorTitle = 'Error de registro';
      let errorMessage = 'No se pudo crear la cuenta. Por favor intenta nuevamente.';

      if (error.message && error.message.includes('ya existe')) {
        errorTitle = 'Email ya registrado';
        errorMessage = 'Este email ya está registrado. Por favor usa otro email o inicia sesión.';
      } else if (error.message && error.message.includes('Network request failed')) {
        errorTitle = 'Error de conexión';
        errorMessage = 'No se pudo conectar al servidor. Verifica tu conexión a internet.';
      } else if (error.message) {
        errorMessage = error.message;
      }

      Alert.alert(errorTitle, errorMessage);
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
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Nombre completo</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="Juan Pérez"
                    placeholderTextColor={COLORS.placeholder}
                    value={fullName}
                    onChangeText={setFullName}
                    autoCapitalize="words"
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Email</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={styles.input}
                    placeholder="tu@email.com"
                    placeholderTextColor={COLORS.placeholder}
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Contraseña</Text>
                <View style={styles.inputContainer}>
                  <TextInput
                    style={[styles.input, styles.inputWithIcon]}
                    placeholder="Mínimo 6 caracteres"
                    placeholderTextColor={COLORS.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                  />
                  <TouchableOpacity
                    style={styles.eyeButton}
                    onPress={() => setShowPassword(!showPassword)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.eyeIcon}>{showPassword ? '👁️' : '👁️‍🗨️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleRegister}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.textLight} />
                ) : (
                  <Text style={styles.buttonText}>Crear cuenta</Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.linkButton}
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
                activeOpacity={0.7}
              >
                <Text style={styles.linkText}>
                  ¿Ya tienes cuenta? <Text style={styles.linkTextBold}>Inicia sesión</Text>
                </Text>
              </TouchableOpacity>
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
    marginBottom: SPACING.md
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
  },
  inputGroup: {
    marginBottom: SPACING.md
  },
  label: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: SPACING.sm
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.sm
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.borderLight,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.text,
    fontWeight: '500'
  },
  inputWithIcon: {
    paddingRight: SPACING.xl * 2
  },
  eyeButton: {
    position: 'absolute',
    right: SPACING.lg,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.sm
  },
  eyeIcon: {
    fontSize: 24
  },
  button: {
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
  buttonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  },
  linkButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
    alignItems: 'center'
  },
  linkText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '500'
  },
  linkTextBold: {
    fontWeight: '700',
    color: COLORS.primary
  }
});

export default RegisterScreen;
