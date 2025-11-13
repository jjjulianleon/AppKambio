import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Secure credential storage service for biometric authentication
 * Uses SecureStore for production (compiled apps) and AsyncStorage for debugging (Expo Go)
 *
 * NOTE: SecureStore doesn't work in Expo Go - it requires compiled native modules
 * For debugging, we use AsyncStorage which works fine in Expo Go
 */

const SECURE_KEYS = {
  BIOMETRIC_EMAIL: 'kambio.secure.biometric_email',
  BIOMETRIC_PASSWORD: 'kambio.secure.biometric_password',
  BIOMETRIC_ENABLED: 'kambio.secure.biometric_enabled'
};

// Check if we're in Expo Go (development) or compiled app (production)
const useSecureStore = __DEV__ === false; // Use SecureStore only in production

/**
 * Helper to determine which storage backend to use
 */
const storage = {
  setItem: async (key, value) => {
    try {
      if (useSecureStore) {
        await SecureStore.setItemAsync(key, value);
      } else {
        // For debugging in Expo Go, use AsyncStorage
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error saving to storage (${useSecureStore ? 'SecureStore' : 'AsyncStorage'}):`, error);
      throw error;
    }
  },

  getItem: async (key) => {
    try {
      if (useSecureStore) {
        return await SecureStore.getItemAsync(key);
      } else {
        // For debugging in Expo Go, use AsyncStorage
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error reading from storage (${useSecureStore ? 'SecureStore' : 'AsyncStorage'}):`, error);
      return null;
    }
  },

  removeItem: async (key) => {
    try {
      if (useSecureStore) {
        await SecureStore.deleteItemAsync(key);
      } else {
        // For debugging in Expo Go, use AsyncStorage
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error deleting from storage (${useSecureStore ? 'SecureStore' : 'AsyncStorage'}):`, error);
      throw error;
    }
  }
};

/**
 * Save credentials securely for biometric authentication
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<boolean>} Success status
 */
export const saveCredentialsForBiometric = async (email, password) => {
  try {
    await storage.setItem(SECURE_KEYS.BIOMETRIC_EMAIL, email);
    await storage.setItem(SECURE_KEYS.BIOMETRIC_PASSWORD, password);
    await storage.setItem(SECURE_KEYS.BIOMETRIC_ENABLED, 'true');
    return true;
  } catch (error) {
    console.error('Error saving credentials for biometric:', error);
    return false;
  }
};

/**
 * Get saved credentials for biometric authentication
 * @returns {Promise<{email: string, password: string} | null>} Saved credentials or null
 */
export const getSavedCredentials = async () => {
  try {
    const biometricEnabled = await storage.getItem(SECURE_KEYS.BIOMETRIC_ENABLED);

    if (biometricEnabled !== 'true') {
      return null;
    }

    const email = await storage.getItem(SECURE_KEYS.BIOMETRIC_EMAIL);
    const password = await storage.getItem(SECURE_KEYS.BIOMETRIC_PASSWORD);

    if (email && password) {
      return { email, password };
    }

    return null;
  } catch (error) {
    console.error('Error getting saved credentials:', error);
    return null;
  }
};

/**
 * Check if biometric authentication is set up (credentials saved)
 * @returns {Promise<boolean>} True if biometric is set up
 */
export const isBiometricSetup = async () => {
  try {
    const biometricEnabled = await storage.getItem(SECURE_KEYS.BIOMETRIC_ENABLED);
    return biometricEnabled === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Clear saved credentials (for logout or when user wants to disable biometric)
 * @returns {Promise<boolean>} Success status
 */
export const clearSavedCredentials = async () => {
  try {
    await storage.removeItem(SECURE_KEYS.BIOMETRIC_EMAIL);
    await storage.removeItem(SECURE_KEYS.BIOMETRIC_PASSWORD);
    await storage.removeItem(SECURE_KEYS.BIOMETRIC_ENABLED);
    return true;
  } catch (error) {
    console.error('Error clearing saved credentials:', error);
    return false;
  }
};

/**
 * Disable biometric authentication (keeps credentials but marks as disabled)
 * @returns {Promise<boolean>} Success status
 */
export const disableBiometric = async () => {
  try {
    await storage.setItem(SECURE_KEYS.BIOMETRIC_ENABLED, 'false');
    return true;
  } catch (error) {
    console.error('Error disabling biometric:', error);
    return false;
  }
};

/**
 * Enable biometric authentication (if credentials exist)
 * @returns {Promise<boolean>} Success status
 */
export const enableBiometric = async () => {
  try {
    const email = await storage.getItem(SECURE_KEYS.BIOMETRIC_EMAIL);
    const password = await storage.getItem(SECURE_KEYS.BIOMETRIC_PASSWORD);

    if (email && password) {
      await storage.setItem(SECURE_KEYS.BIOMETRIC_ENABLED, 'true');
      return true;
    }
    return false;
  } catch (error) {
    console.error('Error enabling biometric:', error);
    return false;
  }
};

export default {
  saveCredentialsForBiometric,
  getSavedCredentials,
  isBiometricSetup,
  clearSavedCredentials,
  disableBiometric,
  enableBiometric
};
