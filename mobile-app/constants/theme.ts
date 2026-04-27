/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

// ================= HELPERLY APP THEME =================
export const AppTheme = {
  // Backgrounds
  background: '#020617',
  backgroundAlt: '#0f172a',
  card: 'rgba(255,255,255,0.06)',
  cardBorder: 'rgba(255,255,255,0.08)',
  cardElevated: 'rgba(255,255,255,0.10)',

  // Primary
  primary: '#3b82f6',
  primaryDark: '#2563eb',
  primaryGlow: 'rgba(59, 130, 246, 0.15)',

  // Accent
  accent: '#6366f1',
  accentGlow: 'rgba(99, 102, 241, 0.15)',

  // Status Colors
  statusPending: '#f59e0b',
  statusPendingBg: 'rgba(245, 158, 11, 0.15)',
  statusPendingBorder: 'rgba(245, 158, 11, 0.3)',
  statusPendingGlow: 'rgba(245, 158, 11, 0.25)',

  statusAccepted: '#10b981',
  statusAcceptedBg: 'rgba(16, 185, 129, 0.15)',
  statusAcceptedBorder: 'rgba(16, 185, 129, 0.3)',
  statusAcceptedGlow: 'rgba(16, 185, 129, 0.25)',

  statusRejected: '#ef4444',
  statusRejectedBg: 'rgba(239, 68, 68, 0.15)',
  statusRejectedBorder: 'rgba(239, 68, 68, 0.3)',
  statusRejectedGlow: 'rgba(239, 68, 68, 0.25)',

  // Text
  textPrimary: '#ffffff',
  textSecondary: '#94a3b8',
  textMuted: '#64748b',
  textHighlight: '#cbd5f5',

  // Pricing
  priceColor: '#38bdf8',

  // Semantic
  success: '#22c55e',
  error: '#ef4444',
  warning: '#f59e0b',
  info: '#3b82f6',

  // Gradients (as tuples for LinearGradient)
  gradientPrimary: ['#3b82f6', '#2563eb'] as const,
  gradientAccent: ['#3b82f6', '#6366f1'] as const,
  gradientBackground: ['#020617', '#020617', '#0f172a'] as const,
  gradientDanger: ['#ef4444', '#dc2626'] as const,
  gradientSuccess: ['#22c55e', '#16a34a'] as const,
  gradientWarning: ['#f59e0b', '#d97706'] as const,
};

// ================= CATEGORY DEFINITIONS =================
export const SERVICE_CATEGORIES = [
  { id: 'all', label: 'All', icon: '🏠', keywords: [] },
  { id: 'cleaning', label: 'Cleaning', icon: '🧹', keywords: ['clean', 'sweep', 'mop', 'dust', 'wash', 'laundry', 'housekeep', 'maid'] },
  { id: 'plumbing', label: 'Plumbing', icon: '🔧', keywords: ['plumb', 'pipe', 'tap', 'drain', 'leak', 'water', 'faucet', 'toilet'] },
  { id: 'electrician', label: 'Electrician', icon: '⚡', keywords: ['electri', 'wire', 'wiring', 'switch', 'socket', 'light', 'fan', 'ac', 'circuit'] },
  { id: 'painting', label: 'Painting', icon: '🎨', keywords: ['paint', 'wall', 'color', 'whitewash', 'coat'] },
  { id: 'gardening', label: 'Gardening', icon: '🌿', keywords: ['garden', 'plant', 'lawn', 'grass', 'tree', 'trim', 'landscap'] },
  { id: 'cooking', label: 'Cooking', icon: '🍳', keywords: ['cook', 'food', 'meal', 'chef', 'kitchen', 'tiffin', 'catering'] },
  { id: 'other', label: 'Other', icon: '📦', keywords: [] },
] as const;

export type ServiceCategoryId = typeof SERVICE_CATEGORIES[number]['id'];

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
