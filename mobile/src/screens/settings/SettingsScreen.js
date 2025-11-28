import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView, Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES, SHADOWS } from '../../utils/constants';
import { getStoredUser, logout } from '../../services/authService';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
  );

  const loadUser = async () => {
    try {
      const userData = await getStoredUser();
      setUser(userData);
    } catch (error) {
      console.error('Error loading user:', error);
    }
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
              // Navigate to Welcome screen (inicio de la app)
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

  const SettingItem = ({ icon, title, subtitle, onPress, color = COLORS.text }) => (
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
      <Text style={styles.settingArrow}>›</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header Card with User Info */}
        <View style={styles.headerCard}>
          {user?.profile_image ? (
            <Image source={{ uri: user.profile_image }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarContainer}>
              <Text style={styles.avatarText}>
                {user?.full_name?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
          )}
          <Text style={styles.userName}>{user?.full_name || 'Usuario'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Settings Sections */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon="👤"
              title="Editar Perfil"
              subtitle="Actualiza tu información personal"
              onPress={() => navigation.navigate(ROUTES.EDIT_PROFILE)}
            />
            <SettingItem
              icon="🤖"
              title="Insights AI"
              subtitle="Tu coach financiero personal"
              onPress={() => navigation.navigate('Insights')}
              color={COLORS.primary}
            />
            <SettingItem
              icon="🔔"
              title="Notificaciones"
              subtitle="Configura tus nudges"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
            <SettingItem
              icon="🔒"
              title="Privacidad y Seguridad"
              subtitle="Controla tu información"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Soporte</Text>
          <View style={styles.settingsList}>
            <SettingItem
              icon="❓"
              title="Ayuda y Soporte"
              subtitle="¿Tienes dudas?"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
            <SettingItem
              icon="📄"
              title="Términos y Condiciones"
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
            />
            <SettingItem
              icon="ℹ️"
              title="Acerca de Kambio"
              subtitle="Versión 1.0.0"
              onPress={() => Alert.alert('Kambio', 'App de Fitness Financiero v1.0.0\n\nDesarrollada para el Concurso Diners Club 2024')}
            />
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.settingsList}>
            <SettingItem
              icon="🚪"
              title="Cerrar Sesión"
              color={COLORS.error}
              onPress={handleLogout}
            />
          </View>
        </View>

        <Text style={styles.version}>Versión 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background
  },
  scrollContent: {
    paddingBottom: 80
  },
  headerCard: {
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    margin: SPACING.md,
    marginTop: SPACING.md,
    padding: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md
  },
  avatarContainer: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: COLORS.textLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  avatarImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: SPACING.md,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)'
  },
  avatarText: {
    fontSize: 40,
    fontWeight: 'bold',
    color: COLORS.primary
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: SPACING.xs
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textLight,
    opacity: 0.9
  },
  section: {
    marginHorizontal: SPACING.md,
    marginBottom: SPACING.md
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    marginLeft: SPACING.xs,
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
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight
  },
  settingIcon: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.sm,
    width: 44
  },
  settingEmoji: {
    fontSize: 32
  },
  settingInfo: { flex: 1 },
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
    fontSize: 24,
    color: COLORS.textSecondary,
    fontWeight: '300'
  },
  version: {
    textAlign: 'center',
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xxl
  }
});

export default SettingsScreen;
