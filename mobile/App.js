import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';
import { ToastProvider } from './src/contexts/ToastContext';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state',
  'expo-notifications: Android Push notifications'
]);

export default function App() {
  useEffect(() => {
    setupNotifications();
  }, []);

  const setupNotifications = async () => {
    try {
      const token = await initializeNotifications();
      if (token) {
        console.log('Push notifications initialized successfully');
      }
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
    }
  };

  return (
    <ToastProvider>
      <StatusBar style="auto" />
      <AppNavigator />
    </ToastProvider>
  );
}
