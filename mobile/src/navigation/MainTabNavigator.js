import React from 'react';
import { Text, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../utils/constants';

// New Screens (Reorganized)
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import FinancesScreen from '../screens/finances/FinancesScreen';
import ProgressScreen from '../screens/main/ProgressScreen';
import CoachScreen from '../screens/main/CoachScreen';

const Tab = createBottomTabNavigator();

const MainTabNavigator = () => {
  const insets = useSafeAreaInsets();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          paddingBottom: Platform.OS === 'ios' ? insets.bottom : 5,
          paddingTop: 5,
          height: Platform.OS === 'ios' ? 60 + insets.bottom : 60,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        },
        headerShown: false
      }}
    >
      {/* Tab 1: Inicio - Dashboard con botón prominente de Kambio */}
      <Tab.Screen
        name="DashboardTab"
        component={DashboardScreen}
        options={{
          tabBarLabel: 'Inicio',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🏠" color={color} />
          )
        }}
      />

      {/* Tab 2: Finanzas - Metas + Ahorros + Gastos */}
      <Tab.Screen
        name="FinancesTab"
        component={FinancesScreen}
        options={{
          tabBarLabel: 'Finanzas',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="📊" color={color} />
          )
        }}
      />

      {/* Tab 3: Progreso - Battle Pass + Savings Pool */}
      <Tab.Screen
        name="ProgressTab"
        component={ProgressScreen}
        options={{
          tabBarLabel: 'Progreso',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🏆" color={color} />
          )
        }}
      />

      {/* Tab 4: Coach - Insights AI + Profile Settings */}
      <Tab.Screen
        name="CoachTab"
        component={CoachScreen}
        options={{
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color, size }) => (
            <TabIcon icon="🧠" color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

// Simple emoji icon component
const TabIcon = ({ icon, color }) => (
  <Text style={{ fontSize: 24, opacity: color === COLORS.primary ? 1 : 0.6 }}>
    {icon}
  </Text>
);

export default MainTabNavigator;
