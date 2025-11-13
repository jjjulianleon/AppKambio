// API Configuration
// Usando localhost para modo tunnel de Expo (funciona desde WSL)
export const API_URL = __DEV__
  ? 'http://172.21.138.33:3000/api'
  // 192.168.0.102 ip casa
  // 172.21.138.33 ip universidad
  : 'https://your-production-api.com/api';

// Colors based on Kambio branding - Inspired by Diners Club design
// Enhanced palette with more tonal variations for better visual harmony
export const COLORS = {
  // Primary palette - Diners Club Blues/Purples
  primary: '#5D6DD9',
  primary50: '#F0F2FE',
  primary100: '#E1E5FD',
  primary200: '#C3CBFB',
  primary300: '#A5B1F9',
  primary400: '#8797F7',
  primary500: '#5D6DD9', // main
  primary600: '#4A5FD9',
  primary700: '#3D4FB8',
  primary800: '#2F3F97',
  primary900: '#222F76',
  primaryLight: '#7B8CFF',
  primaryDark: '#4A5FD9',

  // Secondary palette
  secondary: '#6C7FFF',
  secondary50: '#F2F4FF',
  secondary100: '#E5E9FF',
  secondary200: '#CCD3FF',
  secondary300: '#B2BDFF',
  secondary400: '#99A7FF',
  secondary500: '#6C7FFF', // main
  secondary600: '#5666FF',
  secondary700: '#4052E6',
  secondary800: '#2A3ECC',
  secondary900: '#1E2DB3',
  secondaryLight: '#8E9FFF',
  secondaryDark: '#5666FF',

  // Accent colors - Coral/Pink (complementary to blues)
  accent: '#FF6B9D',
  accent50: '#FFF0F5',
  accent100: '#FFE1EB',
  accent200: '#FFC3D7',
  accent300: '#FFA5C3',
  accent400: '#FF87AF',
  accent500: '#FF6B9D', // main
  accent600: '#FF4B84',
  accent700: '#E6356B',
  accent800: '#CC2052',
  accent900: '#B31439',
  accentLight: '#FF8CB5',
  accentDark: '#FF4B84',

  // Status colors
  success: '#4CAF50',
  success50: '#E8F5E9',
  success100: '#C8E6C9',
  success200: '#A5D6A7',
  success300: '#81C784',
  success400: '#66BB6A',
  success500: '#4CAF50', // main
  success600: '#43A047',
  success700: '#388E3C',
  success800: '#2E7D32',
  success900: '#1B5E20',
  successLight: '#81C784',
  successDark: '#388E3C',

  warning: '#FFC107',
  warning50: '#FFF8E1',
  warning100: '#FFECB3',
  warning200: '#FFE082',
  warning300: '#FFD54F',
  warning400: '#FFCA28',
  warning500: '#FFC107', // main
  warning600: '#FFB300',
  warning700: '#FFA000',
  warning800: '#FF8F00',
  warning900: '#FF6F00',
  warningLight: '#FFD54F',
  warningDark: '#FFA000',

  error: '#F44336',
  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error200: '#EF9A9A',
  error300: '#E57373',
  error400: '#EF5350',
  error500: '#F44336', // main
  error600: '#E53935',
  error700: '#D32F2F',
  error800: '#C62828',
  error900: '#B71C1C',
  errorLight: '#E57373',
  errorDark: '#D32F2F',

  // Info color (new)
  info: '#2196F3',
  info50: '#E3F2FD',
  info100: '#BBDEFB',
  info200: '#90CAF9',
  info300: '#64B5F6',
  info400: '#42A5F5',
  info500: '#2196F3', // main
  info600: '#1E88E5',
  info700: '#1976D2',
  info800: '#1565C0',
  info900: '#0D47A1',
  infoLight: '#64B5F6',
  infoDark: '#1976D2',

  // Neutral colors - Enhanced grays
  background: '#F5F7FA',
  backgroundDark: '#EDF1F7',
  backgroundLight: '#FAFBFC',
  surface: '#FFFFFF',
  surfaceElevated: '#FFFFFF',
  surfaceHover: '#F8FAFC',

  // Text colors
  text: '#1A202C',
  textSecondary: '#718096',
  textTertiary: '#A0AEC0',
  textLight: '#FFFFFF',
  textDisabled: '#CBD5E0',

  // Border and divider colors
  border: '#E2E8F0',
  borderLight: '#EDF2F7',
  borderDark: '#CBD5E0',
  divider: '#E2E8F0',

  // Other
  disabled: '#CBD5E0',
  placeholder: '#A0AEC0',
  overlay: 'rgba(26, 32, 44, 0.7)',
  overlayLight: 'rgba(26, 32, 44, 0.4)',
  overlayDark: 'rgba(26, 32, 44, 0.85)',

  // Gradient colors - Enhanced Diners Club gradients
  gradientStart: '#5D6DD9',
  gradientMiddle: '#6C7FFF',
  gradientEnd: '#7B8CFF',

  // Additional gradient variations
  gradientPurple: ['#5D6DD9', '#8E9FFF'],
  gradientBlue: ['#6C7FFF', '#2196F3'],
  gradientAccent: ['#FF6B9D', '#FF8CB5'],
  gradientSuccess: ['#4CAF50', '#81C784'],

  // Glassmorphism colors
  glass: 'rgba(255, 255, 255, 0.1)',
  glassDark: 'rgba(255, 255, 255, 0.05)',
  glassLight: 'rgba(255, 255, 255, 0.2)',

  // Elevation colors (for depth)
  elevation1: '#FFFFFF',
  elevation2: '#FAFBFC',
  elevation3: '#F7F9FB',
  elevation4: '#F5F7FA',

  // Celebration/Confetti colors (moved from hardcoded values)
  confetti: {
    gold: '#FFD700',
    pink: '#FF6B9D',
    green: '#4CAF50',
    cyan: '#00D9FF',
    coral: '#FF9AA2',
    orange: '#FFB84D'
  }
};

// Typography
export const FONTS = {
  regular: 'System',
  medium: 'System',
  semibold: 'System',
  bold: 'System',
  light: 'System',
  thin: 'System'
};

export const FONT_WEIGHTS = {
  thin: '100',
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900'
};

export const FONT_SIZES = {
  xxs: 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  xxxxl: 40
};

export const LINE_HEIGHTS = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
  loose: 2
};

// Spacing - Enhanced with more granular options
export const SPACING = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64
};

// Border Radius - Enhanced
export const BORDER_RADIUS = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  round: 999,
  circle: '50%'
};

// Shadows (iOS and Android compatible) - Enhanced
export const SHADOWS = {
  none: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0
  },
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1
  },
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8
  },
  xl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 12
  },
  xxl: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 15 },
    shadowOpacity: 0.25,
    shadowRadius: 30,
    elevation: 16
  },
  // Colored shadows for special effects
  colored: {
    shadowColor: '#5D6DD9',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8
  },
  coloredAccent: {
    shadowColor: '#FF6B9D',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8
  },
  coloredSuccess: {
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
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
