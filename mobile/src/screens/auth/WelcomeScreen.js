import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';
import LogoAnimated from '../../components/LogoAnimated';
import ParallaxBackground from '../../components/ParallaxBackground';
import { isBiometricAvailable, authenticate, getBiometricType, getBiometricTypeName } from '../../services/biometricService';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('unknown');

  useEffect(() => {
    // Check biometric availability
    checkBiometric();

    // Start animations
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

  const checkBiometric = async () => {
    const available = await isBiometricAvailable();
    setBiometricAvailable(available);

    if (available) {
      const type = await getBiometricType();
      setBiometricType(type);
    }
  };

  const handleBiometricLogin = async () => {
    const result = await authenticate({
      promptMessage: 'Autentícate para continuar',
      cancelLabel: 'Cancelar',
      fallbackLabel: 'Usar contraseña'
    });

    if (result.success) {
      // Here you would check if user has previously logged in with biometrics
      // For now, navigate to login screen
      Alert.alert(
        'Autenticación exitosa',
        'Por favor ingresa con tu email y contraseña la primera vez para vincular tu biometría.',
        [
          {
            text: 'OK',
            onPress: () => navigation.navigate(ROUTES.LOGIN)
          }
        ]
      );
    } else if (result.error && !result.error.includes('cancelled')) {
      Alert.alert('Error', result.error);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      {/* Parallax Background */}
      <ParallaxBackground
        gradientStart={COLORS.primary}
        gradientEnd={COLORS.secondary}
      />

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
                {/* Animated Logo */}
                <LogoAnimated
                  size={140}
                  speed={3000}
                  colors={{ primary: COLORS.textLight, secondary: COLORS.secondary }}
                />

                <Text style={styles.appName}>Kambio</Text>

                <Text style={styles.subtitle}>
                  Transforma tus gastos hormiga{'\n'}en ahorro inteligente
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
        </Animated.ScrollView>
      </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primary
  },
  safeArea: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    justifyContent: 'center'
  },
  mainContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xxl
  },
  appName: {
    fontSize: FONT_SIZES.xxxl * 1.5,
    fontWeight: '900',
    color: COLORS.textLight,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
    letterSpacing: 1
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    textAlign: 'center',
    lineHeight: FONT_SIZES.lg * 1.5,
    paddingHorizontal: SPACING.md,
    fontWeight: '600',
    opacity: 0.9
  },
  callToAction: {
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xxl
  },
  ctaText: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.textLight,
    textAlign: 'center',
    fontWeight: '700',
    lineHeight: FONT_SIZES.xl * 1.4
  },
  actions: {
    paddingBottom: SPACING.xl,
    width: '100%'
  },
  biometricButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: SPACING.lg,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.xxl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row'
  },
  biometricIcon: {
    fontSize: 28,
    marginRight: SPACING.sm
  },
  biometricText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textLight
  },
  primaryButton: {
    backgroundColor: COLORS.textLight,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    ...SHADOWS.lg
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.primary
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    marginTop: SPACING.sm
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    fontWeight: '600'
  }
});

export default WelcomeScreen;
