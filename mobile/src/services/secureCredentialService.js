import * as SecureStore from 'expo-secure-store';

/**
 * Secure credential storage service for biometric authentication
 * Uses SecureStore to safely store user credentials
 */

const SECURE_KEYS = {
  BIOMETRIC_EMAIL: 'kambio.secure.biometric_email',
  BIOMETRIC_PASSWORD: 'kambio.secure.biometric_password',
  BIOMETRIC_ENABLED: 'kambio.secure.biometric_enabled'
};

/**
 * Save credentials securely for biometric authentication
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<boolean>} Success status
 */
export const saveCredentialsForBiometric = async (email, password) => {
  try {
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_EMAIL, email);
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_PASSWORD, password);
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED, 'true');
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
    const biometricEnabled = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);

    if (biometricEnabled !== 'true') {
      return null;
    }

    const email = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_EMAIL);
    const password = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_PASSWORD);

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
    const biometricEnabled = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
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
    await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_EMAIL);
    await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_PASSWORD);
    await SecureStore.deleteItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED);
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
    await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED, 'false');
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
    const email = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_EMAIL);
    const password = await SecureStore.getItemAsync(SECURE_KEYS.BIOMETRIC_PASSWORD);

    if (email && password) {
      await SecureStore.setItemAsync(SECURE_KEYS.BIOMETRIC_ENABLED, 'true');
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
