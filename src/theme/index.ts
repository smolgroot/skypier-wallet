import { createTheme } from '@mui/material/styles'
import type { Theme, ThemeOptions } from '@mui/material/styles'
import { lightPalette, darkPalette, catppuccinMocha, catppuccinLatte } from './palette'
import { typography } from './typography'

const getThemeOptions = (mode: 'light' | 'dark'): ThemeOptions => {
  const colors = mode === 'light' ? catppuccinLatte : catppuccinMocha;
  
  return {
    palette: mode === 'light' ? lightPalette : darkPalette,
    typography,
    shape: {
      borderRadius: 12,
    },
    spacing: 8,
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            scrollbarColor: `${colors.surface2} ${colors.surface0}`,
            '&::-webkit-scrollbar, & *::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track, & *::-webkit-scrollbar-track': {
              background: colors.surface0,
            },
            '&::-webkit-scrollbar-thumb, & *::-webkit-scrollbar-thumb': {
              background: colors.surface2,
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb:hover, & *::-webkit-scrollbar-thumb:hover': {
              background: colors.overlay0,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 12,
            padding: '10px 24px',
            fontSize: '0.875rem',
            fontWeight: 600,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: 'none',
            },
          },
          outlined: {
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2,
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: 'none',
            border: `1px solid ${colors.surface0}`,
            backgroundColor: colors.mantle,
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
              '& fieldset': {
                borderColor: colors.surface1,
                borderWidth: 2,
              },
              '&:hover fieldset': {
                borderColor: colors.surface2,
              },
              '&.Mui-focused fieldset': {
                borderColor: colors.mauve,
              },
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
            backgroundColor: colors.mantle,
          },
          rounded: {
            borderRadius: 16,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
          colorPrimary: {
            backgroundColor: colors.mauve,
            color: colors.crust,
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
          standardError: {
            backgroundColor: `${colors.red}20`,
            color: colors.red,
          },
          standardWarning: {
            backgroundColor: `${colors.peach}20`,
            color: colors.peach,
          },
          standardInfo: {
            backgroundColor: `${colors.sapphire}20`,
            color: colors.sapphire,
          },
          standardSuccess: {
            backgroundColor: `${colors.green}20`,
            color: colors.green,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: 'none',
            borderBottom: `1px solid ${colors.surface0}`,
            backgroundColor: colors.mantle,
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: {
            borderColor: colors.surface0,
          },
        },
      },
    },
  };
}

export const createAppTheme = (mode: 'light' | 'dark'): Theme => {
  return createTheme(getThemeOptions(mode))
}

export const lightTheme = createAppTheme('light')
export const darkTheme = createAppTheme('dark')
