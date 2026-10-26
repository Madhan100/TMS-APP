export const theme = {
  colors: {
    // Executive Slate & Dark Atmosphere
    background: '#0B0F19',
    backgroundDeep: '#070A10',
    backgroundLight: '#111827',

    // Sleek Frosted Glass Surfaces
    glassBg: 'rgba(17, 24, 39, 0.72)',
    glassBgElevated: 'rgba(30, 41, 59, 0.75)',
    glassBgDark: 'rgba(15, 23, 42, 0.85)',
    glassSurface: 'rgba(30, 41, 59, 0.5)',

    // Refined Edge & Subtle Border Lines
    glassBorder: 'rgba(255, 255, 255, 0.08)',
    glassBorderSpecular: 'rgba(255, 255, 255, 0.18)',
    glassBorderSubtle: 'rgba(255, 255, 255, 0.04)',
    glassBorderGlow: 'rgba(59, 130, 246, 0.25)',

    // Professional Corporate Accents
    liquidCyan: '#38BDF8',
    liquidBlue: '#3B82F6',
    liquidPurple: '#6366F1',
    liquidMagenta: '#EC4899',
    liquidEmerald: '#10B981',
    liquidAmber: '#F59E0B',
    liquidRose: '#EF4444',

    primary: '#3B82F6',
    primaryDark: '#2563EB',
    primaryGlow: 'rgba(59, 130, 246, 0.25)',
    accent: '#10B981',

    // Executive Status Shades
    pending: '#F59E0B',
    assigned: '#6366F1',
    inProgress: '#0EA5E9',
    onHold: '#64748B',
    closed: '#10B981',
    danger: '#EF4444',

    // High-Legibility Typography
    textPrimary: '#F8FAFC',
    textSecondary: '#E2E8F0',
    textMuted: '#94A3B8',
    textDim: '#64748B',
    textHighlight: '#60A5FA',

    // Executive Form Inputs
    inputBg: 'rgba(15, 23, 42, 0.75)',
    inputBorder: 'rgba(255, 255, 255, 0.1)',
    inputBorderSpecular: 'rgba(255, 255, 255, 0.25)',
    inputBorderActive: '#3B82F6',
  },

  gradients: {
    // Cohesive single-tone royal blue & executive palettes
    liquidNeon: ['#2563EB', '#1D4ED8'],
    liquidPrimary: ['#2563EB', '#1D4ED8'],
    liquidEmerald: ['#10B981', '#059669'],
    liquidPurple: ['#6366F1', '#4F46E5'],
    liquidSunset: ['#F59E0B', '#D97706'],
    liquidRose: ['#EF4444', '#DC2626'],

    // Refined Card Fills
    liquidGlassCard: ['#0F172A', '#0F172A'],
    glassSheen: ['transparent', 'transparent'],
    borderSpecular: ['#1E293B', '#1E293B'],
  },

  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
  },

  borderRadius: {
    sm: 8,
    md: 12,
    lg: 18,
    xl: 24,
    full: 9999,
  },

  typography: {
    h1: { fontSize: 24, fontWeight: '800', letterSpacing: -0.5 },
    h2: { fontSize: 19, fontWeight: '700', letterSpacing: -0.3 },
    h3: { fontSize: 16, fontWeight: '600' },
    body: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
    bodyBold: { fontSize: 14, fontWeight: '600' },
    caption: { fontSize: 12, fontWeight: '400' },
    captionBold: { fontSize: 12, fontWeight: '600' },
    badge: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  },
};
