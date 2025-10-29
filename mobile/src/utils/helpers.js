/**
 * Format number as currency
 * @param {number} amount
 * @returns {string}
 */
export const formatCurrency = (amount) => {
  return `$${parseFloat(amount).toFixed(2)}`;
};

/**
 * Format percentage
 * @param {number} value
 * @returns {string}
 */
export const formatPercentage = (value) => {
  return `${parseFloat(value).toFixed(0)}%`;
};

/**
 * Calculate progress percentage
 * @param {number} current
 * @param {number} target
 * @returns {number}
 */
export const calculateProgress = (current, target) => {
  if (target === 0) return 0;
  return Math.round(Math.min((current / target) * 100, 100));
};

/**
 * Format date to readable string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDate = (date) => {
  const d = new Date(date);
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return d.toLocaleDateString('es-ES', options);
};

/**
 * Format date to short string
 * @param {string|Date} date
 * @returns {string}
 */
export const formatDateShort = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
};

/**
 * Get relative time (e.g., "hace 2 horas")
 * @param {string|Date} date
 * @returns {string}
 */
export const getRelativeTime = (date) => {
  const d = new Date(date);
  const now = new Date();
  const seconds = Math.floor((now - d) / 1000);

  const intervals = {
    año: 31536000,
    mes: 2592000,
    semana: 604800,
    día: 86400,
    hora: 3600,
    minuto: 60,
    segundo: 1
  };

  for (const [name, value] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / value);
    if (interval >= 1) {
      return `Hace ${interval} ${name}${interval > 1 ? (name === 'mes' ? 'es' : 's') : ''}`;
    }
  }

  return 'Ahora mismo';
};

/**
 * Validate email format
 * @param {string} email
 * @returns {boolean}
 */
export const isValidEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

/**
 * Validate password strength
 * @param {string} password
 * @returns {object} { isValid, message }
 */
export const validatePassword = (password) => {
  if (password.length < 6) {
    return { isValid: false, message: 'La contraseña debe tener al menos 6 caracteres' };
  }
  return { isValid: true, message: '' };
};

/**
 * Truncate text
 * @param {string} text
 * @param {number} maxLength
 * @returns {string}
 */
export const truncateText = (text, maxLength = 50) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get greeting based on time of day
 * @returns {string}
 */
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Buenos días';
  if (hour < 19) return 'Buenas tardes';
  return 'Buenas noches';
};

/**
 * Debounce function
 * @param {function} func
 * @param {number} wait
 * @returns {function}
 */
export const debounce = (func, wait = 300) => {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

/**
 * Generate random ID
 * @returns {string}
 */
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};
