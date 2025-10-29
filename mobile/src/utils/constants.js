// API Configuration
// Usando localhost para modo tunnel de Expo (funciona desde WSL)
export const API_URL = __DEV__
  ? 'http://172.21.138.98:3000/api'  // Mantén tu IP, pero usa tunnel en Expo
  : 'https://your-production-api.com/api';

// Colors based on Kambio branding
export const COLORS = {
  primary: '#6C63FF',
  secondary: '#5A52D5',
  accent: '#FF6584',
  success: '#4CAF50',
  warning: '#FFC107',
  error: '#F44336',
  background: '#F8F9FA',
  surface: '#FFFFFF',
  text: '#212121',
  textSecondary: '#757575',
  textLight: '#FFFFFF',
  border: '#E0E0E0',
  disabled: '#BDBDBD',
  placeholder: '#9E9E9E'
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  bold: 'System',
  light: 'System'
};

export const FONT_SIZES = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32
};

// Spacing
export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48
};

// Border Radius
export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 999
};

// Default Values
export const DEFAULT_KAMBIO_AMOUNT = 4.00;
export const MIN_GOAL_AMOUNT = 10.00;
export const MAX_GOAL_NAME_LENGTH = 50;

// Expense Categories (Predefined)
export const PREDEFINED_CATEGORIES = [
  { id: 1, name: 'Cafés', emoji: '☕', defaultAmount: 4.00 },
  { id: 2, name: 'Comida a domicilio', emoji: '🍔', defaultAmount: 8.00 },
  { id: 3, name: 'Snacks', emoji: '🍿', defaultAmount: 3.00 },
  { id: 4, name: 'Taxi/Uber', emoji: '🚕', defaultAmount: 5.00 },
  { id: 5, name: 'Streaming', emoji: '📺', defaultAmount: 10.00 },
  { id: 6, name: 'Compras impulsivas', emoji: '🛍️', defaultAmount: 15.00 }
];

// Navigation Routes
export const ROUTES = {
  // Auth
  WELCOME: 'Welcome',
  LOGIN: 'Login',
  REGISTER: 'Register',

  // Onboarding
  PROFILE: 'Profile',
  TRANSACTIONS: 'Transactions',
  CATEGORIES: 'Categories',

  // Main App
  DASHBOARD: 'Dashboard',
  CREATE_GOAL: 'CreateGoal',
  GOAL_DETAIL: 'GoalDetail',
  KAMBIO: 'Kambio',

  // Settings
  SETTINGS: 'Settings',
  NUDGE_SETTINGS: 'NudgeSettings'
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@kambio:token',
  USER: '@kambio:user',
  ONBOARDING_COMPLETED: '@kambio:onboarding_completed'
};

// Nudge Times
export const DEFAULT_NUDGE_TIMES = {
  time1: '10:00',
  time2: '15:00',
  time3: '20:00'
};
