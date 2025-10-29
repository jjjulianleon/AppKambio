import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES, SHADOWS } from '../../utils/constants';

const WelcomeScreen = ({ navigation }) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
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
  }, []);

  return (
    <LinearGradient
      colors={[COLORS.gradientStart, COLORS.gradientMiddle, COLORS.gradientEnd]}
      style={styles.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={styles.container}>
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
            <View style={styles.header}>
              <Text style={styles.title}>Kambio</Text>
              <Text style={styles.subtitle}>
                Transforma tus gastos hormiga{'\n'}en ahorro inteligente
              </Text>
            </View>

            <View style={styles.features}>
              <FeatureItem
                emoji="🎯"
                text="Crea metas de ahorro realistas"
              />
              <FeatureItem
                emoji="☕"
                text="Identifica tus gastos hormiga"
              />
              <FeatureItem
                emoji="📱"
                text="Recibe recordatorios inteligentes"
              />
              <FeatureItem
                emoji="🎉"
                text="Celebra cada Kambio"
              />
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => navigation.navigate(ROUTES.REGISTER)}
              >
                <LinearGradient
                  colors={[COLORS.textLight, COLORS.textLight]}
                  style={styles.primaryButton}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  <Text style={styles.primaryButtonText}>Comenzar</Text>
                </LinearGradient>
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
    </LinearGradient>
  );
};

const FeatureItem = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  gradient: {
    flex: 1
  },
  container: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: SPACING.xl
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.xl,
    paddingTop: SPACING.xxl,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl
  },
  title: {
    fontSize: FONT_SIZES.xxxl * 1.8,
    fontWeight: '800',
    color: COLORS.textLight,
    marginBottom: SPACING.md,
    letterSpacing: -1
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    opacity: 0.9,
    textAlign: 'center',
    lineHeight: FONT_SIZES.lg * 1.5,
    paddingHorizontal: SPACING.md
  },
  features: {
    marginVertical: SPACING.xl,
    paddingHorizontal: SPACING.sm
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)'
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  featureEmoji: {
    fontSize: 28
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    flex: 1,
    fontWeight: '500'
  },
  actions: {
    marginTop: SPACING.lg,
    paddingBottom: SPACING.md
  },
  primaryButton: {
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
    fontWeight: '600',
    opacity: 0.9
  }
});

export default WelcomeScreen;
