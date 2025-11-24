// API Configuration
// Usando localhost para modo tunnel de Expo (funciona desde WSL)
export const API_URL = __DEV__
  ? 'http://172.21.138.188:3000/api'
  // 192.168.0.102 ip casa
  // 172.21.138.188 ip universidad (actualizada)
  : 'https://your-production-api.com/api';

// Colors - Enhanced palette with more humanistic, warm tones
export const COLORS = {
  // Primary palette - Softer, more approachable purples
  primary: '#6366F1',           // Indigo-600 - More vibrant and friendly
  primaryLight: '#818CF8',      // Indigo-400 - Lighter, softer
  primaryDark: '#4F46E5',       // Indigo-700 - Deeper, richer
  primaryAlpha10: 'rgba(99, 102, 241, 0.1)',
  primaryAlpha20: 'rgba(99, 102, 241, 0.2)',
  primaryAlpha30: 'rgba(99, 102, 241, 0.3)',

  // Secondary palette - Warmer cyan/teal for balance
  secondary: '#06B6D4',         // Cyan-500 - Fresh and energetic
  secondaryLight: '#22D3EE',    // Cyan-400 - Bright highlight
  secondaryDark: '#0891B2',     // Cyan-600 - Deeper accent
  secondaryAlpha10: 'rgba(6, 182, 212, 0.1)',
  secondaryAlpha20: 'rgba(6, 182, 212, 0.2)',

  // Accent colors - Warm pink for joy and celebration
  accent: '#EC4899',            // Pink-500 - Vibrant, joyful
  accentLight: '#F472B6',       // Pink-400 - Soft, friendly
  accentDark: '#DB2777',        // Pink-600 - Bold, confident
  accentAlpha10: 'rgba(236, 72, 153, 0.1)',
  accentAlpha20: 'rgba(236, 72, 153, 0.2)',

  // Success - Natural green, more organic
  success: '#10B981',           // Emerald-500 - Fresh growth
  successLight: '#34D399',      // Emerald-400 - Light celebration
  successDark: '#059669',       // Emerald-600 - Deep confidence
  successAlpha10: 'rgba(16, 185, 129, 0.1)',
  successAlpha20: 'rgba(16, 185, 129, 0.2)',

  // Warning - Warm amber, less harsh
  warning: '#F59E0B',           // Amber-500 - Warm attention
  warningLight: '#FBBF24',      // Amber-400 - Gentle alert
  warningDark: '#D97706',       // Amber-600 - Strong caution
  warningAlpha10: 'rgba(245, 158, 11, 0.1)',
  warningAlpha20: 'rgba(245, 158, 11, 0.2)',

  // Error - Softer red, less aggressive
  error: '#EF4444',             // Red-500 - Clear but not harsh
  errorLight: '#F87171',        // Red-400 - Gentle indication
  errorDark: '#DC2626',         // Red-600 - Strong alert
  errorAlpha10: 'rgba(239, 68, 68, 0.1)',
  errorAlpha20: 'rgba(239, 68, 68, 0.2)',

  // Info - Calm blue for information
  info: '#3B82F6',              // Blue-500 - Trustworthy
  infoLight: '#60A5FA',         // Blue-400 - Gentle
  infoDark: '#2563EB',          // Blue-600 - Confident
  infoAlpha10: 'rgba(59, 130, 246, 0.1)',
  infoAlpha20: 'rgba(59, 130, 246, 0.2)',

  // Gold - For achievements and rewards
  gold: '#F59E0B',              // Amber-500 (warm gold)
  goldLight: '#FCD34D',         // Amber-300
  goldDark: '#D97706',          // Amber-600

  // Neutral colors - Warmer, more inviting grays
  background: '#F9FAFB',        // Gray-50 - Soft, clean
  backgroundLight: '#FFFFFF',   // Pure white
  backgroundDark: '#F3F4F6',    // Gray-100 - Subtle depth
  surface: '#FFFFFF',           // White surface
  surfaceElevated: '#FFFFFF',   // Elevated surface
  surfaceAlpha: 'rgba(255, 255, 255, 0.9)',

  // Text colors - Better contrast, more readable
  text: '#111827',              // Gray-900 - Strong readability
  textSecondary: '#6B7280',     // Gray-500 - Clear hierarchy
  textTertiary: '#9CA3AF',      // Gray-400 - Subtle information
  textLight: '#FFFFFF',         // White text
  textInverse: '#F9FAFB',       // Light on dark

  // Border and divider colors
  border: '#E5E7EB',            // Gray-200 - Subtle separation
  borderLight: '#F3F4F6',       // Gray-100 - Very subtle
  borderDark: '#D1D5DB',        // Gray-300 - Defined
  divider: '#E5E7EB',           // Gray-200

  // Overlays with proper opacity
  overlay: 'rgba(17, 24, 39, 0.75)',      // Dark overlay
  overlayLight: 'rgba(17, 24, 39, 0.5)',  // Medium overlay
  overlayDark: 'rgba(17, 24, 39, 0.9)',   // Strong overlay

  // White overlays for light surfaces
  whiteOverlay10: 'rgba(255, 255, 255, 0.1)',
  whiteOverlay20: 'rgba(255, 255, 255, 0.2)',
  whiteOverlay30: 'rgba(255, 255, 255, 0.3)',
  whiteOverlay40: 'rgba(255, 255, 255, 0.4)',
  whiteOverlay50: 'rgba(255, 255, 255, 0.5)',

  // State colors
  disabled: '#D1D5DB',          // Gray-300
  placeholder: '#9CA3AF',       // Gray-400
  focus: '#6366F1',             // Primary color
  hover: '#F3F4F6',             // Gray-100

  // Gradient colors - Harmonious flow
  gradientStart: '#6366F1',     // Primary
  gradientMiddle: '#8B5CF6',    // Violet-500
  gradientEnd: '#EC4899'        // Accent
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
  xxxl: 32,
  display: 48,    // For hero/display text
  huge: 64        // For special large displays
};

// Font Weights - Standardized
export const FONT_WEIGHTS = {
  light: '300',
  regular: '400',
  medium: '500',
  semibold: '600',
  bold: '700',
  extrabold: '800',
  black: '900'
};

// Spacing
export const SPACING = {
  xxs: 2,     // Extra extra small - for tight spacing
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  xxxl: 64    // For very large spacing
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
  xs: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 0.5 },
    shadowOpacity: 0.03,
    shadowRadius: 1,
    elevation: 1
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
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8
  },
  coloredAccent: {
    shadowColor: '#EC4899',
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

// Layout Constants
export const LAYOUT = {
  tabBarHeight: 60,
  tabBarClearance: 100,      // Bottom padding to prevent content hiding behind tab bar
  headerHeight: 44,
  minTouchTarget: 44,        // Minimum touch target size for accessibility
  maxContentWidth: 600,      // Maximum width for content on tablets
  cardSpacing: SPACING.md
};

// Opacity Values - Standardized
export const OPACITY = {
  disabled: 0.5,
  inactive: 0.6,
  secondary: 0.7,
  primary: 0.85,
  emphasis: 0.9,
  full: 1
};

// Animation Durations - Consistent timing
export const ANIMATION_DURATION = {
  instant: 0,
  fastest: 150,
  fast: 200,
  normal: 300,
  slow: 500,
  slower: 700,
  slowest: 1000
};

// Animation Easing - For custom animations
export const ANIMATION_EASING = {
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
  easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
  spring: 'spring'
};

// Z-Index Layers - For proper stacking
export const Z_INDEX = {
  base: 0,
  raised: 10,
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  modalBackdrop: 400,
  modal: 500,
  popover: 600,
  tooltip: 700,
  notification: 800,
  toast: 900
};

// Icon Sizes
export const ICON_SIZES = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
  xxl: 48
};

// Avatar Sizes
export const AVATAR_SIZES = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
  xxl: 80,
  huge: 120
};

// Image Heights
export const IMAGE_HEIGHTS = {
  thumbnail: 80,
  small: 120,
  card: 160,
  large: 200,
  hero: 240,
  fullHeight: 300
};

// Button Heights
export const BUTTON_HEIGHTS = {
  small: 32,
  medium: 40,
  large: 48,
  xlarge: 56
};

// Input Heights
export const INPUT_HEIGHTS = {
  small: 36,
  medium: 44,
  large: 52
};

// Haptic Feedback Types (to be used with expo-haptics)
export const HAPTIC_TYPES = {
  light: 'light',
  medium: 'medium',
  heavy: 'heavy',
  success: 'success',
  warning: 'warning',
  error: 'error',
  selection: 'selection'
};
