import { createTheme } from '@mui/material/styles'
import type { Theme, ThemeOptions } from '@mui/material/styles'
import { lightPalette, darkPalette } from './palette'
import { typography } from './typography'

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => ({
  palette: mode === 'light' ? lightPalette : darkPalette,
  typography,
  shape: {
    borderRadius: 8,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 24px',
          fontSize: '0.875rem',
          fontWeight: 500,
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: 'none',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: mode === 'light' 
            ? '0 2px 8px rgba(0, 0, 0, 0.08)'
            : '0 2px 8px rgba(0, 0, 0, 0.4)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8,
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
        rounded: {
          borderRadius: 12,
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: 'none',
          borderBottom: `1px solid ${mode === 'light' ? '#e0e0e0' : '#2e2e2e'}`,
        },
      },
    },
  },
})

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme(getThemeOptions(mode))
}

export const lightTheme = createAppTheme('light')
export const darkTheme = createAppTheme('dark')
