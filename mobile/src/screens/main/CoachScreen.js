import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Animated,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getInsight } from '../../services/insightService';
import { getStoredUser, logout } from '../../services/authService';
import { haptics } from '../../utils/haptics';

const CoachScreen = ({ navigation }) => {
  // Insights State
  const [insight, setInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(true);
  const [analyzedCount, setAnalyzedCount] = useState(0);

  // User State
  const [user, setUser] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    loadInitialData();

    // Animate entrance
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

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadInitialData = async () => {
    await Promise.all([fetchInsight(), loadUser()]);
  };

  const loadUser = async () => {
    try {
      const userData = await getStoredUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
  };

  const fetchInsight = async () => {
    try {
      setLoadingInsight(true);
      const data = await getInsight();
      setInsight(data.insight);
      setAnalyzedCount(data.analyzedTransactions);
    } catch (error) {
      setInsight('Hubo un problema al conectar con tu asistente financiero. Intenta más tarde.');
      setAnalyzedCount(0);
    } finally {
      setLoadingInsight(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchInsight(), loadUser()]);
  };

  const handleGenerateNewInsight = () => {
    haptics.medium();
    fetchInsight();
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro que deseas cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              haptics.success();
              navigation.getParent()?.reset({
                index: 0,
                routes: [{ name: ROUTES.WELCOME }]
              });
            } catch (error) {
              Alert.alert('Error', 'No se pudo cerrar sesión');
            }
          }
        }
      ]
    );
  };

  const SettingItem = ({ icon, title, subtitle, onPress, color = COLORS.text, showArrow = true }) => (
    <TouchableOpacity
      style={styles.settingItem}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.settingIcon}>
        <Text style={styles.settingEmoji}>{icon}</Text>
      </View>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingTitle, { color }]}>{title}</Text>
        {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
      </View>
      {showArrow && <Text style={styles.settingArrow}>›</Text>}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor={COLORS.primary}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>🧠 Tu Coach</Text>
            <Text style={styles.subtitle}>
              Consejos personalizados con inteligencia artificial
            </Text>
          </View>

          {/* AI Coach Card - Prominent */}
          <View style={styles.coachCard}>
            <View style={styles.coachHeader}>
              <Text style={styles.robotEmoji}>🤖</Text>
              <View style={styles.coachHeaderText}>
                <Text style={styles.coachTitle}>Tu Coach Financiero AI</Text>
                <Text style={styles.coachSubtitle}>
                  Consejos personalizados basados en tus gastos
                </Text>
              </View>
            </View>

            {loadingInsight ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Analizando tus gastos...</Text>
              </View>
            ) : (
              <>
                <View style={styles.insightCard}>
                  <View style={styles.insightHeader}>
                    <Text style={styles.insightTitle}>💡 Consejo del Día</Text>
                    {analyzedCount > 0 && (
                      <View style={styles.badge}>
                        <Text style={styles.badgeText}>
                          {analyzedCount} transacción{analyzedCount !== 1 ? 'es' : ''}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.insightText}>{insight}</Text>
                </View>

                <TouchableOpacity
                  style={styles.generateButton}
                  onPress={handleGenerateNewInsight}
                  disabled={loadingInsight}
                  activeOpacity={0.8}
                >
                  <Text style={styles.generateButtonText}>
                    Generar Nuevo Consejo
                  </Text>
                  <Text style={styles.generateButtonIcon}>✨</Text>
                </TouchableOpacity>
              </>
            )}
          </View>

          {/* Quick Actions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Perfil y Configuración</Text>
            <View style={styles.settingsList}>
              <SettingItem
                icon="👤"
                title="Mi Perfil"
                subtitle={user?.email || ''}
                onPress={() => {
                  haptics.selection();
                  navigation.navigate(ROUTES.EDIT_PROFILE);
                }}
              />
              <SettingItem
                icon="🔔"
                title="Notificaciones"
                subtitle="Configura tus nudges"
                onPress={() => {
                  haptics.selection();
                  Alert.alert('Próximamente', 'Esta función estará disponible pronto');
                }}
              />
              <SettingItem
                icon="❓"
                title="Ayuda y Soporte"
                subtitle="¿Tienes dudas?"
                onPress={() => {
                  haptics.selection();
                  Alert.alert('Próximamente', 'Esta función estará disponible pronto');
                }}
              />
              <SettingItem
                icon="ℹ️"
                title="Acerca de Kambio"
                subtitle="Versión 1.0.0"
                onPress={() => {
                  haptics.selection();
                  Alert.alert('Kambio', 'App de Fitness Financiero v1.0.0\n\nDesarrollada para el Concurso Diners Club 2024');
                }}
              />
              <SettingItem
                icon="🚪"
                title="Cerrar Sesión"
                color={COLORS.error}
                onPress={() => {
                  haptics.medium();
                  handleLogout();
                }}
              />
            </View>
          </View>

          <Text style={styles.version}>Versión 1.0.0</Text>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 100
  },
  header: {
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.lg
  },
  title: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: -0.5,
    marginBottom: SPACING.xs
  },
  subtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.md * 1.5
  },
  coachCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.md
  },
  coachHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg
  },
  robotEmoji: {
    fontSize: 40,
    marginRight: SPACING.md,
    marginTop: SPACING.xs / 2
  },
  coachHeaderText: {
    flex: 1
  },
  coachTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2
  },
  coachSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.4
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: SPACING.xl
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontWeight: '600'
  },
  insightCard: {
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    marginBottom: SPACING.md
  },
  insightHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    paddingBottom: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.primary + '20'
  },
  insightTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textLight
  },
  badge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs / 2,
    borderRadius: BORDER_RADIUS.round
  },
  badgeText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '600',
    color: COLORS.textLight
  },
  insightText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textLight,
    lineHeight: FONT_SIZES.md * 1.6
  },
  generateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    ...SHADOWS.sm
  },
  generateButtonText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textLight,
    marginRight: SPACING.sm
  },
  generateButtonIcon: {
    fontSize: FONT_SIZES.lg
  },
  profileCard: {
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    ...SHADOWS.sm
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  avatarContainer: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  avatarImage: {
    width: 64,
    height: 64,
    borderRadius: BORDER_RADIUS.round,
    marginRight: SPACING.md
  },
  avatarText: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.primary
  },
  profileInfo: {
    flex: 1
  },
  userName: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: SPACING.xs / 2
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.primary,
    padding: SPACING.sm,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.md
  },
  editProfileText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textLight
  },
  editProfileIcon: {
    fontSize: FONT_SIZES.lg,
    color: COLORS.textLight,
    fontWeight: '700'
  },
  section: {
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  settingsList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  settingIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    width: 40
  },
  settingEmoji: {
    fontSize: 24
  },
  settingInfo: {
    flex: 1
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    marginBottom: 2
  },
  settingSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary
  },
  settingArrow: {
    fontSize: 20,
    color: COLORS.textSecondary,
    fontWeight: '300'
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.error,
    ...SHADOWS.sm
  },
  logoutIcon: {
    fontSize: 20,
    marginRight: SPACING.sm
  },
  logoutText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.error
  },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg
  }
});

export default CoachScreen;
