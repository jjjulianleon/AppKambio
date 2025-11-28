import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Alert,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';
import { isBiometricAvailable, authenticate, getBiometricType, getBiometricTypeName } from '../../services/biometricService';
import { getSavedCredentials, isBiometricSetup } from '../../services/secureCredentialService';
import { login } from '../../services/authService';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('unknown');
  const [biometricSetup, setBiometricSetup] = useState(false);

  useEffect(() => {
    // Start animations on mount
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();

    // Pulse animation for biometric button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true
        })
      ])
    ).start();
  }, []);

  // Check biometric setup every time screen is focused (important for after logout)
  useFocusEffect(
    useCallback(() => {
      checkBiometric();
    }, [])
  );

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    const setup = await isBiometricSetup();

    setBiometricAvailable(available);
    setBiometricSetup(setup);

    if (available) {
      const type = await getBiometricType();
      setBiometricType(type);
    }
  };

  const handleBiometricLogin = async () => {
    // Check if biometric is set up
    if (!biometricSetup) {
      Alert.alert(
        'Configuración requerida',
        'Por favor inicia sesión con tu email y contraseña la primera vez para habilitar la autenticación biométrica.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(ROUTES.LOGIN)
          }
        ]
      );
      return;
    }

    // Authenticate with biometric
    const result = await authenticate({
      promptMessage: 'Autentícate para continuar',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar contraseña'
    });

    if (result.success) {
      // Get saved credentials
      const credentials = await getSavedCredentials();

      if (!credentials) {
        Alert.alert(
          'Error',
          'No se pudieron recuperar las credenciales guardadas. Por favor inicia sesión manualmente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate(ROUTES.LOGIN)
            }
          ]
        );
        return;
      }

      // Login with saved credentials
      try {
        await login(credentials.email, credentials.password);

        // Navigate to main app
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
      } catch (error) {
        // If login fails, ask user to login manually
        Alert.alert(
          'Error de inicio de sesión',
          'No se pudo iniciar sesión con las credenciales guardadas. Por favor inicia sesión manualmente.',
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate(ROUTES.LOGIN)
            }
          ]
        );
      }
    } else if (result.error && !result.error.includes('cancelled')) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
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
            <View style={styles.mainContent}>
              <View style={styles.header}>
                {/* Logo Image */}
                <Image
                  source={require('../../../assets/images/logoKambio.jpg')}
                  style={styles.logo}
                  resizeMode="contain"
                />

                <Text style={styles.subtitle}>
                  ¡Transforma tus gastos hormiga{'\n'}en ahorro inteligente!
                </Text>
              </View>

              <View style={styles.callToAction}>
                <Text style={styles.ctaText}>
                  ¿Estás listo para hacer el Kambio?
                </Text>
              </View>
            </View>

            <View style={styles.actions}>
              {/* Biometric Button - only show if available */}
              {biometricAvailable && (
                <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                  <TouchableOpacity
                    style={styles.biometricButton}
                    activeOpacity={0.8}
                    onPress={handleBiometricLogin}
                  >
                    <Text style={styles.biometricIcon}>
                      {biometricType === 'faceID' ? '👤' : '👆'}
                    </Text>
                    <Text style={styles.biometricText}>
                      {getBiometricTypeName(biometricType)}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              )}

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(ROUTES.REGISTER)}
              >
                <Text style={styles.primaryButtonText}>Comenzar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.secondaryButton}
                activeOpacity={0.7}
                onPress={() => navigation.navigate(ROUTES.LOGIN)}
              >
                <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF'
  },
  safeArea: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.md // Reduced padding
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'space-between', // Distribute space between main content and actions
    paddingVertical: SPACING.lg
  },
  mainContent: {
    flex: 1,
    justifyContent: 'flex-start', // Changed from center to pull content up
    alignItems: 'center',
    paddingTop: SPACING.xxl // Add some top padding
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.md, // Reduced from lg
    width: '100%'
  },
  logo: {
    width: '100%',
    height: 280, // Reduced from 350 to minimize whitespace
    marginBottom: 0 // Removed margin completely
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.lg * 1.4,
    paddingHorizontal: SPACING.md,
    fontWeight: '600',
    opacity: 0.9
  },
  callToAction: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xl, // Reduced from xxl
    marginBottom: SPACING.xl  // Reduced from xxl
  },
  ctaText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: FONT_SIZES.xl * 1.3
  },
  actions: {
    width: '100%',
    paddingBottom: SPACING.sm
  },
  biometricButton: {
    backgroundColor: COLORS.backgroundDark,
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg, // Increased from md
    borderWidth: 1,
    borderColor: COLORS.border,
    flexDirection: 'row'
  },
  biometricIcon: {
    fontSize: 24,
    marginRight: SPACING.sm
  },
  biometricText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.text
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.md, // Increased from sm
    ...SHADOWS.lg
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textLight
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.md // Increased from xs
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600'
  }
});

export default WelcomeScreen;
