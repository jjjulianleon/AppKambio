import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic Feedback Utility
 * Provides consistent haptic feedback across the app
 * Automatically handles platform differences
 */

// Check if haptics are available on the device
const isHapticsAvailable = Platform.OS === 'ios' || Platform.OS === 'android';

/**
 * Light impact - For UI element selections and toggles
 * Use: Button taps, switch toggles, checkbox selections
 */
export const lightImpact = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch (error) {
    // Silently fail if haptics not supported
    console.log('Haptic feedback not available');
  }
};

/**
 * Medium impact - For important actions
 * Use: Creating goals, registering kambios, confirming actions
 */
export const mediumImpact = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Heavy impact - For critical or completing actions
 * Use: Goal completion, significant milestones
 */
export const heavyImpact = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Success notification - For successful operations
 * Use: Goal created successfully, kambio saved, contribution made
 */
export const successNotification = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Warning notification - For warning states
 * Use: Low balance warnings, approaching limits
 */
export const warningNotification = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Error notification - For error states
 * Use: Failed operations, validation errors, network errors
 */
export const errorNotification = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Selection change - For picker/selector changes
 * Use: Month selection, filter changes, tab switches
 */
export const selectionChange = async () => {
  if (!isHapticsAvailable) return;
  try {
    await Haptics.selectionAsync();
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Celebration pattern - Multiple haptics for special moments
 * Use: Goal completion, achievement unlocked, level up
 */
export const celebrate = async () => {
  if (!isHapticsAvailable) return;
  try {
    await successNotification();
    setTimeout(async () => await mediumImpact(), 100);
    setTimeout(async () => await mediumImpact(), 200);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

/**
 * Double tap pattern - For confirmations
 * Use: Delete confirmations, important decisions
 */
export const doubleTap = async () => {
  if (!isHapticsAvailable) return;
  try {
    await lightImpact();
    setTimeout(async () => await lightImpact(), 100);
  } catch (error) {
    console.log('Haptic feedback not available');
  }
};

// Export a consolidated object for easy importing
export const haptics = {
  light: lightImpact,
  medium: mediumImpact,
  heavy: heavyImpact,
  success: successNotification,
  warning: warningNotification,
  error: errorNotification,
  selection: selectionChange,
  celebrate: celebrate,
  doubleTap: doubleTap
};

export default haptics;
