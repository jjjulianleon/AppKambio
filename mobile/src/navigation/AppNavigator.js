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
import ProfileScreen from '../screens/onboarding/ProfileScreen';
import TransactionsScreen from '../screens/onboarding/TransactionsScreen';
import CategoryScreen from '../screens/onboarding/CategoryScreen';
import CreateGoalScreen from '../screens/goal/CreateGoalScreen';
import GoalDetailScreen from '../screens/goal/GoalDetailScreen';
import KambioScreen from '../screens/kambio/KambioScreen';
import EditProfileScreen from '../screens/settings/EditProfileScreen';

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

  // Determine initial route
  // Always start at Welcome screen for demo purposes
  const initialRouteName = ROUTES.WELCOME;

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
          options={{ title: 'Registrar Kambio', presentation: 'modal' }}
        />
        <Stack.Screen
          name={ROUTES.EDIT_PROFILE}
          component={EditProfileScreen}
          options={{ 
            title: 'Editar Perfil',
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
