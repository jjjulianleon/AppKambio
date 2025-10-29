import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import api from './api';

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
});

/**
 * Request notification permissions
 */
export const requestPermissions = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Must use physical device for push notifications');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification');
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error requesting notification permissions:', error);
    return false;
  }
};

/**
 * Get Expo push token
 */
export const getExpoPushToken = async () => {
  try {
    if (!Device.isDevice) {
      console.log('Push notifications not available on simulator/emulator');
      return null;
    }

    // Skip push token in Expo Go - not supported
    if (__DEV__) {
      console.log('Push notifications not available in Expo Go. Use development build for full functionality.');
      return null;
    }

    const token = await Notifications.getExpoPushTokenAsync({
      projectId: 'your-project-id' // Update with your Expo project ID when using development build
    });

    return token.data;
  } catch (error) {
    console.error('Error getting push token:', error);
    return null;
  }
};

/**
 * Register push token with backend
 */
export const registerPushToken = async (token) => {
  try {
    await api.post('/nudges/push-token', {
      expo_push_token: token
    });
    console.log('Push token registered successfully');
    return true;
  } catch (error) {
    console.error('Error registering push token:', error);
    return false;
  }
};

/**
 * Setup notification channels (Android only)
 */
export const setupNotificationChannels = async () => {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('kambio-nudges', {
      name: 'Kambio Nudges',
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#6C63FF',
      sound: 'default'
    });
  }
};

/**
 * Initialize notifications
 */
export const initializeNotifications = async () => {
  try {
    // Request permissions
    const hasPermission = await requestPermissions();
    if (!hasPermission) {
      return null;
    }

    // Setup channels (Android)
    await setupNotificationChannels();

    // Get push token
    const token = await getExpoPushToken();
    if (token) {
      // Register token with backend
      await registerPushToken(token);
    }

    return token;
  } catch (error) {
    console.error('Error initializing notifications:', error);
    return null;
  }
};

/**
 * Schedule local notification
 */
export const scheduleLocalNotification = async (title, body, data = {}, seconds = 0) => {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: 'default'
      },
      trigger: seconds > 0 ? { seconds } : null
    });
  } catch (error) {
    console.error('Error scheduling notification:', error);
  }
};

/**
 * Cancel all scheduled notifications
 */
export const cancelAllNotifications = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error('Error canceling notifications:', error);
  }
};

/**
 * Add notification received listener
 */
export const addNotificationReceivedListener = (callback) => {
  return Notifications.addNotificationReceivedListener(callback);
};

/**
 * Add notification response listener (when user taps notification)
 */
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener(callback);
};

/**
 * Get nudge settings from backend
 */
export const getNudgeSettings = async () => {
  try {
    const response = await api.get('/nudges/settings');
    return response.data;
  } catch (error) {
    console.error('Error getting nudge settings:', error);
    throw error;
  }
};

/**
 * Update nudge settings
 */
export const updateNudgeSettings = async (settings) => {
  try {
    const response = await api.put('/nudges/settings', settings);
    return response.data;
  } catch (error) {
    console.error('Error updating nudge settings:', error);
    throw error;
  }
};

/**
 * Toggle nudges on/off
 */
export const toggleNudges = async (isActive) => {
  try {
    const response = await api.post('/nudges/toggle', {
      is_active: isActive
    });
    return response.data;
  } catch (error) {
    console.error('Error toggling nudges:', error);
    throw error;
  }
};
