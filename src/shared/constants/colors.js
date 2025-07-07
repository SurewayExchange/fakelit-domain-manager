// CareConnect Brand Colors & Design System
export const COLORS = {
  // Primary Brand Colors
  primary: {
    main: '#2A7F62',      // Deep teal/green - calming, professional
    light: '#4A9F82',     // Lighter teal
    dark: '#1A5F42',      // Darker teal
    contrast: '#FFFFFF'   // White text on primary
  },
  
  // Accent Colors
  accent: {
    warm: '#F4A259',      // Warm orange - welcoming, friendly
    cool: '#6B9AC4',      // Cool blue - trust, stability
    neutral: '#F7F7FF'    // Off-white - clean, calm
  },
  
  // Semantic Colors
  semantic: {
    success: '#4CAF50',   // Green - positive actions
    warning: '#FF9800',   // Orange - caution
    error: '#F44336',     // Red - errors, danger
    info: '#2196F3'       // Blue - information
  },
  
  // Neutral Colors
  neutral: {
    50: '#FAFAFA',        // Very light gray
    100: '#F5F5F5',       // Light gray
    200: '#EEEEEE',       // Lighter gray
    300: '#E0E0E0',       // Gray
    400: '#BDBDBD',       // Medium gray
    500: '#9E9E9E',       // Gray
    600: '#757575',       // Dark gray
    700: '#616161',       // Darker gray
    800: '#424242',       // Very dark gray
    900: '#212121'        // Almost black
  },
  
  // Background Colors
  background: {
    primary: '#FFFFFF',   // Main background
    secondary: '#F8F9FA', // Secondary background
    tertiary: '#F1F3F4',  // Tertiary background
    dark: '#1A1A1A'       // Dark background
  },
  
  // Text Colors
  text: {
    primary: '#212121',   // Main text
    secondary: '#757575', // Secondary text
    disabled: '#BDBDBD',  // Disabled text
    inverse: '#FFFFFF'    // Text on dark backgrounds
  }
};

// Gradient Definitions
export const GRADIENTS = {
  primary: 'linear-gradient(135deg, #2A7F62 0%, #4A9F82 100%)',
  accent: 'linear-gradient(135deg, #F4A259 0%, #F7B267 100%)',
  hero: 'linear-gradient(135deg, #2A7F62 0%, #6B9AC4 100%)',
  card: 'linear-gradient(135deg, #FFFFFF 0%, #F8F9FA 100%)'
};

// Shadow Definitions
export const SHADOWS = {
  small: '0 2px 4px rgba(0, 0, 0, 0.1)',
  medium: '0 4px 8px rgba(0, 0, 0, 0.12)',
  large: '0 8px 16px rgba(0, 0, 0, 0.15)',
  xlarge: '0 16px 32px rgba(0, 0, 0, 0.18)'
};

// Border Radius
export const BORDER_RADIUS = {
  small: '4px',
  medium: '8px',
  large: '12px',
  xlarge: '16px',
  round: '50%'
};

// Spacing Scale
export const SPACING = {
  xs: '4px',
  sm: '8px',
  md: '16px',
  lg: '24px',
  xl: '32px',
  xxl: '48px',
  xxxl: '64px'
};

// Typography Scale
export const TYPOGRAPHY = {
  fontFamily: {
    primary: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    secondary: '"Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    mono: '"Fira Code", "Monaco", "Cascadia Code", monospace'
  },
  fontSize: {
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px',
    xxxl: '32px',
    display: '48px'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.75
  }
};

// Breakpoints
export const BREAKPOINTS = {
  xs: '320px',
  sm: '576px',
  md: '768px',
  lg: '992px',
  xl: '1200px',
  xxl: '1400px'
};

// Z-Index Scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070
};

export default {
  COLORS,
  GRADIENTS,
  SHADOWS,
  BORDER_RADIUS,
  SPACING,
  TYPOGRAPHY,
  BREAKPOINTS,
  Z_INDEX
}; 