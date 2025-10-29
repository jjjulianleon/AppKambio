import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, BORDER_RADIUS, FONT_SIZES, ROUTES } from '../../utils/constants';

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Kambio</Text>
            <Text style={styles.subtitle}>Fitness Financiero para tu vida</Text>
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
              onPress={() => navigation.navigate(ROUTES.REGISTER)}
            >
              <Text style={styles.primaryButtonText}>Comenzar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => navigation.navigate(ROUTES.LOGIN)}
            >
              <Text style={styles.secondaryButtonText}>Ya tengo cuenta</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const FeatureItem = ({ emoji, text }) => (
  <View style={styles.featureItem}>
    <Text style={styles.featureEmoji}>{emoji}</Text>
    <Text style={styles.featureText}>{text}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.textLight
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40
  },
  content: {
    flex: 1,
    padding: SPACING.xl,
    justifyContent: 'space-between'
  },
  header: {
    alignItems: 'center',
    marginTop: SPACING.xxl
  },
  logo: {
    fontSize: 80,
    marginBottom: SPACING.md
  },
  title: {
    fontSize: FONT_SIZES.xxxl * 1.5,
    fontWeight: 'bold',
    color: COLORS.primary,
    marginBottom: SPACING.sm
  },
  subtitle: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.primary,
    opacity: 0.8,
    textAlign: 'center'
  },
  features: {
    marginVertical: SPACING.xl
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    backgroundColor: COLORS.primary + '10',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg
  },
  featureEmoji: {
    fontSize: 32,
    marginRight: SPACING.md
  },
  featureText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    flex: 1
  },
  actions: {
    marginTop: SPACING.md,
    paddingBottom: SPACING.md
  },
  primaryButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  primaryButtonText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.textLight
  },
  secondaryButton: {
    paddingVertical: SPACING.md,
    alignItems: 'center'
  },
  secondaryButtonText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.primary,
    textDecorationLine: 'underline'
  }
});

export default WelcomeScreen;
