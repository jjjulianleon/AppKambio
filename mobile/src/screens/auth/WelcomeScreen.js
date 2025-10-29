import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
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
            <View style={styles.header}>
              <Image
                source={require('../../../assets/images/logoKambio.jpg')}
                style={styles.logo}
                resizeMode="contain"
              />
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

const FeatureItem = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <View style={styles.featureIconContainer}>
      <Text style={styles.featureEmoji}>{emoji}</Text>
    </View>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.textLight
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
    paddingTop: SPACING.xxl,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xl
  },
  logo: {
    width: 180,
    height: 180,
    marginBottom: SPACING.lg
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.lg * 1.5,
    paddingHorizontal: SPACING.md,
    fontWeight: '600'
  },
  features: {
    marginVertical: SPACING.xl,
    paddingHorizontal: SPACING.sm
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md
  },
  featureIconContainer: {
    width: 50,
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.textLight,
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
    fontWeight: '600'
  },
  actions: {
    marginTop: SPACING.lg,
    paddingBottom: SPACING.md
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
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
    marginTop: SPACING.sm
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline'
  }
});

export default WelcomeScreen;
