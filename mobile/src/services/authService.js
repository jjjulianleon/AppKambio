import AsyncStorage from '@react-native-async-storage/async-storage';
import api, { handleResponse, handleError } from './api';
import { STORAGE_KEYS } from '../utils/constants';

/**
 * Register new user
 */
export const register = async (email, password, fullName) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      full_name: fullName
    });
    const data = handleResponse(response);

    // Save token and user to storage
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Login user
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    const data = handleResponse(response);

    // Save token and user to storage
    await AsyncStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.user));

    return data;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Logout user
 */
export const logout = async () => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    await AsyncStorage.removeItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
  } catch (error) {
    console.error('Error logging out:', error);
  }
};

/**
 * Get current user profile
 */
export const getProfile = async () => {
  try {
    const response = await api.get('/auth/profile');
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (data) => {
  try {
    const response = await api.put('/auth/profile', data);
    const result = handleResponse(response);

    // Update user in storage
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(result.user));

    return result;
  } catch (error) {
    handleError(error);
  }
};

/**
 * Update financial profile (onboarding data)
 */
export const updateFinancialProfile = async (data) => {
  try {
    const response = await api.post('/auth/financial-profile', data);
    return handleResponse(response);
  } catch (error) {
    handleError(error);
  }
};

/**
 * Check if user is logged in
 */
export const isLoggedIn = async () => {
  try {
    const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
    return !!token;
  } catch (error) {
    return false;
  }
};

/**
 * Get stored user data
 */
export const getStoredUser = async () => {
  try {
    const userJson = await AsyncStorage.getItem(STORAGE_KEYS.USER);
    return userJson ? JSON.parse(userJson) : null;
  } catch (error) {
    return null;
  }
};

/**
 * Check if onboarding is completed
 */
export const isOnboardingCompleted = async () => {
  try {
    const completed = await AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED);
    return completed === 'true';
  } catch (error) {
    return false;
  }
};

/**
 * Mark onboarding as completed
 */
export const markOnboardingCompleted = async () => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true');
  } catch (error) {
    console.error('Error marking onboarding as completed:', error);
  }
};

/**
 * Alias for updateProfile
 */
export const updateUserProfile = updateProfile;
