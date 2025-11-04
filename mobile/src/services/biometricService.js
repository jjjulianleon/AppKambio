import * as LocalAuthentication from 'expo-local-authentication';

/**
 * Biometric authentication service for Face ID and Touch ID
 */

/**
 * Check if biometric authentication is available on the device
 * @returns {Promise<boolean>} True if biometric auth is available
 */
export const isBiometricAvailable = async () => {
  try {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    if (!hasHardware) {
      return false;
    }

    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    return isEnrolled;
  } catch (error) {
    return false;
  }
};

/**
 * Get the type of biometric authentication available
 * @returns {Promise<'faceID' | 'touchID' | 'iris' | 'fingerprint' | 'unknown'>}
 */
export const getBiometricType = async () => {
  try {
    const types = await LocalAuthentication.supportedAuthenticationTypesAsync();

    if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
      return 'faceID';
    }

    if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
      return 'touchID';
    }

    if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
      return 'iris';
    }

    return 'unknown';
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Authenticate user with biometrics
 * @param {Object} options - Authentication options
 * @param {string} options.promptMessage - Message to show in authentication prompt
 * @param {string} options.cancelLabel - Label for cancel button
 * @param {string} options.fallbackLabel - Label for fallback button
 * @returns {Promise<{success: boolean, error?: string, biometricType?: string}>}
 */
export const authenticate = async (options = {}) => {
  try {
    // Check if biometric is available
    const isAvailable = await isBiometricAvailable();

    if (!isAvailable) {
      return {
        success: false,
        error: 'Biometric authentication is not available on this device'
      };
    }

    // Get biometric type for better UX
    const biometricType = await getBiometricType();

    // Authenticate
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: options.promptMessage || 'Authenticate to continue',
      cancelLabel: options.cancelLabel || 'Cancel',
      fallbackLabel: options.fallbackLabel || 'Use Passcode',
      disableDeviceFallback: false
    });

    if (result.success) {
      return {
        success: true,
        biometricType
      };
    } else {
      // Handle different error cases
      let errorMessage = 'Authentication failed';

      if (result.error === 'user_cancel') {
        errorMessage = 'Authentication was cancelled';
      } else if (result.error === 'system_cancel') {
        errorMessage = 'Authentication was cancelled by the system';
      } else if (result.error === 'lockout') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else if (result.error === 'not_enrolled') {
        errorMessage = 'No biometric credentials are enrolled';
      }

      return {
        success: false,
        error: errorMessage
      };
    }
  } catch (error) {
    return {
      success: false,
      error: 'An unexpected error occurred during authentication'
    };
  }
};

/**
 * Get a user-friendly name for the biometric type
 * @param {string} type - Biometric type
 * @returns {string} User-friendly name
 */
export const getBiometricTypeName = (type) => {
  const names = {
    faceID: 'Face ID',
    touchID: 'Touch ID',
    iris: 'Iris Scan',
    fingerprint: 'Fingerprint',
    unknown: 'Biometric'
  };

  return names[type] || 'Biometric';
};

export default {
  isBiometricAvailable,
  getBiometricType,
  authenticate,
  getBiometricTypeName
};
