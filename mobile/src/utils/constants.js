// API Configuration
// Usando localhost para modo tunnel de Expo (funciona desde WSL)
export const API_URL = __DEV__
  ? 'http://192.168.5.158:3000/api'
  // 192.168.0.102 ip casa
  // 172.21.138.104 ip universidad
  : 'https://your-production-api.com/api';

// Colors based on Kambio branding - Inspired by Diners Club design
export const COLORS = {
  // Primary palette
  primary: '#5D6DD9',
  primaryLight: '#7B8CFF',
  primaryDark: '#4A5FD9',
  secondary: '#6C7FFF',
  secondaryLight: '#8E9FFF',

  // Accent colors
  accent: '#FF6B9D',
  accentLight: '#FF8CB5',

  // Status colors
  success: '#4CAF50',
  successLight: '#81C784',
  warning: '#FFC107',
  warningLight: '#FFD54F',
  error: '#F44336',
  errorLight: '#E57373',

  // Neutral colors
  background: '#F5F7FA',
  backgroundLight: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',

  // Text colors
  text: '#1A202C',
  textSecondary: '#718096',
  textTertiary: '#A0AEC0',
  textLight: '#FFFFFF',

  // Border and divider colors
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  divider: '#CBD5E0',

  // Other
  disabled: '#CBD5E0',
  placeholder: '#A0AEC0',
  overlay: 'rgba(26, 32, 44, 0.7)',

  // Gradient colors
  gradientStart: '#5D6DD9',
  gradientMiddle: '#6C7FFF',
  gradientEnd: '#7B8CFF'
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
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  round: 999
};

// Shadows (iOS and Android compatible)
export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 8
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.16,
    shadowRadius: 16,
    elevation: 12
  },
  colored: {
    shadowColor: '#5D6DD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  }
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

  // Savings Pool
  SAVINGS_POOL: 'SavingsPool',
  CREATE_REQUEST: 'CreateRequest',

  // Settings
  SETTINGS: 'Settings',
  EDIT_PROFILE: 'EditProfile',
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
