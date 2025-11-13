/**
 * Logger Utility
 *
 * Sistema de logging condicional que solo muestra logs en modo desarrollo
 * y puede integrarse con servicios de tracking en producción.
 */

const isDev = __DEV__;

/**
 * Logger object with conditional logging
 */
export const logger = {
  /**
   * Log general information (only in development)
   */
  log: (...args) => {
    if (isDev) {
      console.log(...args);
    }
  },

  /**
   * Log debug information (only in development)
   */
  debug: (...args) => {
    if (isDev) {
      console.debug('🔍', ...args);
    }
  },

  /**
   * Log info with icon (only in development)
   */
  info: (...args) => {
    if (isDev) {
      console.info('ℹ️', ...args);
    }
  },

  /**
   * Log warnings (always, but can be sent to tracking service in production)
   */
  warn: (...args) => {
    if (isDev) {
      console.warn('⚠️', ...args);
    } else {
      // TODO: Send to tracking service (Sentry, Firebase, etc.)
      console.warn(...args);
    }
  },

  /**
   * Log errors (always, should be sent to tracking service)
   */
  error: (...args) => {
    if (isDev) {
      console.error('❌', ...args);
    } else {
      // TODO: Send to tracking service (Sentry, Firebase, etc.)
      console.error(...args);
    }
  },

  /**
   * Log success messages (only in development)
   */
  success: (...args) => {
    if (isDev) {
      console.log('✅', ...args);
    }
  },

  /**
   * Group logs together (only in development)
   */
  group: (label, callback) => {
    if (isDev) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },

  /**
   * Log a table (only in development)
   */
  table: (data) => {
    if (isDev) {
      console.table(data);
    }
  }
};

export default logger;
