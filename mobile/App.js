import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import AppNavigator from './src/navigation/AppNavigator';
import { initializeNotifications } from './src/services/notificationService';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Non-serializable values were found in the navigation state'
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
    <>
      <StatusBar style="auto" />
      <AppNavigator />
    </>
  );
}
