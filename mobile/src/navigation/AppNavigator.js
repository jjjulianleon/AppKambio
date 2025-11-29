import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

import { isLoggedIn, isOnboardingCompleted } from '../services/authService';
import { COLORS, ROUTES } from '../utils/constants';

// Import screens
import WelcomeScreen from '../screens/auth/WelcomeScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import ProfileScreen from '../screens/onboarding/ProfileScreen';
import TransactionsScreen from '../screens/onboarding/TransactionsScreen';
import CategoryScreen from '../screens/onboarding/CategoryScreen';
import CreateGoalScreen from '../screens/goal/CreateGoalScreen';
import GoalDetailScreen from '../screens/goal/GoalDetailScreen';
import KambioScreen from '../screens/kambio/KambioScreen';
import CreateRequestScreen from '../screens/pool/CreateRequestScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';
import RewardDetailScreen from '../screens/rewards/RewardDetailScreen';
import BattlePassHistoryScreen from '../screens/rewards/BattlePassHistoryScreen';
import BattlePassScreen from '../screens/rewards/BattlePassScreen';
import InsightsScreen from '../screens/main/InsightsScreen';

// Import tab navigator
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const loggedIn = await isLoggedIn();
      const onboarded = await isOnboardingCompleted();

      setUserLoggedIn(loggedIn);
      setOnboardingComplete(onboarded);
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  // Determine initial route based on auth status
  let initialRouteName = ROUTES.WELCOME;

  // Solo si está logueado Y tiene onboarding completo, va al MainTabs
  // Si está logueado pero sin onboarding, también va a Welcome (no debería pasar)
  // Si no está logueado, siempre va a Welcome
  if (userLoggedIn && onboardingComplete) {
    initialRouteName = 'MainTabs';
  } else {
    initialRouteName = ROUTES.WELCOME;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRouteName}
        screenOptions={{
          headerStyle: {
            backgroundColor: COLORS.primary
          },
          headerTintColor: COLORS.textLight,
          headerTitleStyle: {
            fontWeight: 'bold'
          }
        }}
      >
        {/* Auth Screens */}
        <Stack.Screen
          name={ROUTES.WELCOME}
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.LOGIN}
          component={LoginScreen}
          options={{
            title: '',
            headerBackTitle: 'Inicio'
          }}
        />
        <Stack.Screen
          name={ROUTES.REGISTER}
          component={RegisterScreen}
          options={{
            title: '',
            headerBackTitle: 'Inicio'
          }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{
            title: '',
            headerBackTitle: 'Login'
          }}
        />

        {/* Onboarding Screens */}
        <Stack.Screen
          name={ROUTES.PROFILE}
          component={ProfileScreen}
          options={{ title: 'Tu Perfil', headerLeft: null }}
        />
        <Stack.Screen
          name={ROUTES.TRANSACTIONS}
          component={TransactionsScreen}
          options={{ title: 'Tus Transacciones' }}
        />
        <Stack.Screen
          name={ROUTES.CATEGORIES}
          component={CategoryScreen}
          options={{ title: 'Gastos Hormiga' }}
        />

        {/* Goal Screens */}
        <Stack.Screen
          name={ROUTES.CREATE_GOAL}
          component={CreateGoalScreen}
          options={{ title: 'Crear Meta' }}
        />
        <Stack.Screen
          name={ROUTES.GOAL_DETAIL}
          component={GoalDetailScreen}
          options={{
            title: '',
            headerBackTitle: 'Página Principal'
          }}
        />

        {/* Main App Screens */}
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name={ROUTES.KAMBIO}
          component={KambioScreen}
          options={{
            headerShown: false,
            presentation: 'modal'
          }}
        />
        <Stack.Screen
          name={ROUTES.CREATE_REQUEST}
          component={CreateRequestScreen}
          options={{
            title: 'Solicitar Ayuda',
            headerBackTitle: 'Pozo'
          }}
        />
        <Stack.Screen
          name={ROUTES.EDIT_PROFILE}
          component={EditProfileScreen}
          options={{
            title: 'Editar Perfil',
            headerBackTitle: 'Perfil'
          }}
        />
        <Stack.Screen
          name={ROUTES.BATTLE_PASS}
          component={BattlePassScreen}
          options={{
            title: 'Battle Pass',
            headerBackTitle: 'Progreso'
          }}
        />
        <Stack.Screen
          name="RewardDetail"
          component={RewardDetailScreen}
          options={{
            title: 'Recompensa',
            headerBackTitle: 'Battle Pass'
          }}
        />
        <Stack.Screen
          name="BattlePassHistory"
          component={BattlePassHistoryScreen}
          options={{
            title: 'Historial',
            headerBackTitle: 'Battle Pass'
          }}
        />
        <Stack.Screen
          name="Insights"
          component={InsightsScreen}
          options={{
            title: 'Insights AI',
            headerBackTitle: 'Perfil'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background
  }
});

export default AppNavigator;
