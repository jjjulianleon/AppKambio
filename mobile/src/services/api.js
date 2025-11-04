import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL, STORAGE_KEYS } from '../utils/constants';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      // Silent error - token might not exist yet (first time login)
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        await AsyncStorage.removeItem(STORAGE_KEYS.TOKEN);
        await AsyncStorage.removeItem(STORAGE_KEYS.USER);
        // You can emit an event here to redirect to login screen
      }

      return Promise.reject({
        status,
        message: data.message || data.error || 'Error en el servidor',
        details: data.details || null
      });
    } else if (error.request) {
      // Request was made but no response
      return Promise.reject({
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet.',
        isNetworkError: true
      });
    } else {
      // Something else happened
      return Promise.reject({
        message: error.message || 'Error desconocido'
      });
    }
  }
);

/**
 * Helper function to handle API responses
 */
export const handleResponse = (response) => {
  return response.data;
};

/**
 * Helper function to handle API errors
 * Silent mode - no console.error to avoid red messages in console
 */
export const handleError = (error) => {
  // Just re-throw the error without logging to console
  throw error;
};

export default api;
