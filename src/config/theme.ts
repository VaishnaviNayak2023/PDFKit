export const THEME = {
  colors: {
    bgPrimary: '#050505',
    bgSecondary: '#0B0F14',
    bgCard: '#111827',
    bgElevated: '#141B24',
    bgCardHover: '#1A2430',
    bgGlass: 'rgba(255, 255, 255, 0.04)',
    bgGlassHover: 'rgba(255, 255, 255, 0.07)',
    border: 'rgba(255, 255, 255, 0.06)',
    borderHover: 'rgba(255, 255, 255, 0.14)',
    borderFocus: 'rgba(255, 255, 255, 0.24)',
    textPrimary: '#FFFFFF',
    textSecondary: '#A1A1AA',
    textMuted: '#71717A',
    primary: '#4F8CFF',
    success: '#22C55E',
    warning: '#F59E0B',
    danger: '#EF4444',
    purple: '#8B5CF6',
    blue: '#4F8CFF',
    green: '#22C55E',
    amber: '#F59E0B',
    red: '#EF4444',
    pink: '#EC4899',
    orange: '#F97316',
    cyan: '#06B6D4',
    indigo: '#6366F1',
    teal: '#14B8A6'
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px'
  },
  borderRadius: {
    sm: '6px',
    md: '10px',
    lg: '14px',
    xl: '20px',
    full: '9999px'
  },
  fontSize: {
    xs: '11px',
    sm: '13px',
    base: '14px',
    md: '15px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
    display: '48px'
  },
  shadows: {
    card: '0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.4)',
    cardHover: '0 8px 24px rgba(0,0,0,0.35)',
    modal: '0 20px 60px rgba(0,0,0,0.7)',
    glow: '0 0 24px rgba(79,140,255,0.28)'
  }
} as const

export type ThemeColor = keyof typeof THEME.colors
export default THEME
