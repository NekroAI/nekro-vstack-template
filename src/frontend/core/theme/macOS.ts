import { createTheme, alpha } from '@mui/material/styles'
import type { ThemeMode, ColorPalette } from '@/frontend/shared/stores/theme'

// 优先使用 Inter，后备系统字体
const systemFont = [
  'Inter',
  '-apple-system',
  'BlinkMacSystemFont',
  '"Segoe UI"',
  'Roboto',
  'Helvetica',
  'Arial',
  'sans-serif',
  '"Apple Color Emoji"',
  '"Segoe UI Emoji"',
  '"Segoe UI Symbol"',
].join(',')

// macOS System Colors
export const systemColors = {
  blue: {
    light: '#007AFF',
    dark: '#0A84FF',
  },
  purple: {
    light: '#AF52DE',
    dark: '#BF5AF2',
  },
  green: {
    light: '#34C759',
    dark: '#30D158',
  },
  orange: {
    light: '#FF9500',
    dark: '#FF9F0A',
  },
  red: {
    light: '#FF3B30',
    dark: '#FF453A',
  },
  indigo: {
    light: '#5856D6',
    dark: '#5E5CE6',
  },
  gray: {
    light: '#8E8E93',
    dark: '#98989D',
  },
}

export const getTheme = (mode: ThemeMode, paletteName: ColorPalette) => {
  const isLight = mode === 'light'
  const colorSet = systemColors[paletteName as keyof typeof systemColors]
  const primaryColor = isLight ? colorSet.light : colorSet.dark

  // macOS 风格背景色
  const backgroundDefault = isLight ? '#F5F5F7' : '#000000'
  const backgroundPaper = isLight ? '#FFFFFF' : '#1C1C1E'
  const textPrimary = isLight ? '#1D1D1F' : '#F5F5F7'
  const textSecondary = isLight ? '#86868B' : '#86868B'

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primaryColor,
      },
      background: {
        default: backgroundDefault,
        paper: backgroundPaper,
      },
      text: {
        primary: textPrimary,
        secondary: textSecondary,
      },
      divider: isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.12)',
    },
    typography: {
      fontFamily: systemFont,
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 600 },
      h4: { fontWeight: 600 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    shape: {
      borderRadius: 12,
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: backgroundDefault,
            transition: 'background-color 0.3s ease',
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: '8px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          contained: {
            '&:active': {
              filter: 'brightness(0.9)',
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: '16px',
            boxShadow: isLight ? '0 2px 12px rgba(0,0,0,0.04)' : '0 2px 12px rgba(0,0,0,0.2)',
            border: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundColor: alpha(backgroundPaper, 0.8),
            backdropFilter: 'blur(20px)',
            boxShadow: 'none',
            borderBottom: `1px solid ${isLight ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}`,
            color: textPrimary,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            backgroundColor: alpha(backgroundPaper, 0.8),
            backdropFilter: 'blur(20px)',
            borderRight: 'none',
          },
        },
      },
    },
  })
}
