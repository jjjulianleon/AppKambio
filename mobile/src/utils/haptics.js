/**
 * Haptic Feedback Utility
 *
 * Proporciona feedback háptico en dispositivos iOS y Android
 * Tipos disponibles:
 * - selection: Feedback ligero al seleccionar algo
 * - impactLight: Impacto ligero
 * - impactMedium: Impacto medio
 * - impactHeavy: Impacto pesado
 * - notificationSuccess: Notificación de éxito
 * - notificationWarning: Notificación de advertencia
 * - notificationError: Notificación de error
 */

import ReactNativeHapticFeedback from 'react-native-haptic-feedback';

const options = {
  enableVibrateFallback: true,
  ignoreAndroidSystemSettings: false
};

export const haptics = {
  /**
   * Feedback ligero para selecciones
   */
  selection: () => {
    ReactNativeHapticFeedback.trigger('selection', options);
  },

  /**
   * Impacto ligero - Para botones pequeños o toggles
   */
  light: () => {
    ReactNativeHapticFeedback.trigger('impactLight', options);
  },

  /**
   * Impacto medio - Para botones normales
   */
  medium: () => {
    ReactNativeHapticFeedback.trigger('impactMedium', options);
  },

  /**
   * Impacto pesado - Para acciones importantes
   */
  heavy: () => {
    ReactNativeHapticFeedback.trigger('impactHeavy', options);
  },

  /**
   * Notificación de éxito
   */
  success: () => {
    ReactNativeHapticFeedback.trigger('notificationSuccess', options);
  },

  /**
   * Notificación de advertencia
   */
  warning: () => {
    ReactNativeHapticFeedback.trigger('notificationWarning', options);
  },

  /**
   * Notificación de error
   */
  error: () => {
    ReactNativeHapticFeedback.trigger('notificationError', options);
  },

  /**
   * Trigger genérico con tipo personalizado
   */
  trigger: (type = 'selection') => {
    ReactNativeHapticFeedback.trigger(type, options);
  }
};

export default haptics;
