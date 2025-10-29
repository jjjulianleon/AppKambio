import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS, ROUTES } from '../../utils/constants';
import { getStoredUser, logout } from '../../services/authService';

const SettingsScreen = ({ navigation }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

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
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Perfil</Text>
        </View>

        {/* User Info Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {user?.full_name?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
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
              onPress={() => Alert.alert('Próximamente', 'Esta función estará disponible pronto')}
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
  container: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { paddingBottom: 80 },
  header: {
    padding: SPACING.xl,
    paddingTop: SPACING.md,
    backgroundColor: COLORS.surface
  },
  headerTitle: {
    fontSize: FONT_SIZES.xxxl,
    fontWeight: 'bold',
    color: COLORS.text
  },
  userCard: {
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    margin: SPACING.xl,
    marginTop: SPACING.lg,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md
  },
  avatarText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: COLORS.textLight
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: SPACING.xs
  },
  userEmail: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary
  },
  section: {
    marginHorizontal: SPACING.xl,
    marginBottom: SPACING.lg
  },
  sectionTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  settingsList: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden'
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md
  },
  settingEmoji: { fontSize: 20 },
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
