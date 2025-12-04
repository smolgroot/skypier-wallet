import type { PaletteOptions } from '@mui/material/styles'

/**
 * Catppuccin Mocha Palette
 * https://catppuccin.com/palette
 */
const catppuccinMocha = {
  // Base colors
  base: '#1e1e2e',
  mantle: '#181825',
  crust: '#11111b',
  
  // Surface colors
  surface0: '#313244',
  surface1: '#45475a',
  surface2: '#585b70',
  
  // Overlay colors
  overlay0: '#6c7086',
  overlay1: '#7f849c',
  overlay2: '#9399b2',
  
  // Text colors
  text: '#cdd6f4',
  subtext0: '#a6adc8',
  subtext1: '#bac2de',
  
  // Accent colors
  rosewater: '#f5e0dc',
  flamingo: '#f2cdcd',
  pink: '#f5c2e7',
  mauve: '#cba6f7',
  red: '#f38ba8',
  maroon: '#eba0ac',
  peach: '#fab387',
  yellow: '#f9e2af',
  green: '#a6e3a1',
  teal: '#94e2d5',
  sky: '#89dceb',
  sapphire: '#74c7ec',
  blue: '#89b4fa',
  lavender: '#b4befe',
}

/**
 * Catppuccin Latte Palette (Light mode)
 */
const catppuccinLatte = {
  // Base colors
  base: '#eff1f5',
  mantle: '#e6e9ef',
  crust: '#dce0e8',
  
  // Surface colors
  surface0: '#ccd0da',
  surface1: '#bcc0cc',
  surface2: '#acb0be',
  
  // Overlay colors
  overlay0: '#9ca0b0',
  overlay1: '#8c8fa1',
  overlay2: '#7c7f93',
  
  // Text colors
  text: '#4c4f69',
  subtext0: '#6c6f85',
  subtext1: '#5c5f77',
  
  // Accent colors
  rosewater: '#dc8a78',
  flamingo: '#dd7878',
  pink: '#ea76cb',
  mauve: '#8839ef',
  red: '#d20f39',
  maroon: '#e64553',
  peach: '#fe640b',
  yellow: '#df8e1d',
  green: '#40a02b',
  teal: '#179299',
  sky: '#04a5e5',
  sapphire: '#209fb5',
  blue: '#1e66f5',
  lavender: '#7287fd',
}

export const lightPalette: PaletteOptions = {
  mode: 'light',
  primary: {
    main: catppuccinLatte.mauve,
    light: catppuccinLatte.lavender,
    dark: catppuccinLatte.mauve,
    contrastText: '#ffffff',
  },
  secondary: {
    main: catppuccinLatte.pink,
    light: catppuccinLatte.flamingo,
    dark: catppuccinLatte.maroon,
    contrastText: '#ffffff',
  },
  error: {
    main: catppuccinLatte.red,
    light: catppuccinLatte.maroon,
    dark: catppuccinLatte.red,
  },
  warning: {
    main: catppuccinLatte.peach,
    light: catppuccinLatte.yellow,
    dark: catppuccinLatte.peach,
  },
  info: {
    main: catppuccinLatte.sapphire,
    light: catppuccinLatte.sky,
    dark: catppuccinLatte.blue,
  },
  success: {
    main: catppuccinLatte.green,
    light: catppuccinLatte.teal,
    dark: catppuccinLatte.green,
  },
  background: {
    default: catppuccinLatte.base,
    paper: catppuccinLatte.mantle,
  },
  text: {
    primary: catppuccinLatte.text,
    secondary: catppuccinLatte.subtext0,
  },
  divider: catppuccinLatte.surface0,
}

export const darkPalette: PaletteOptions = {
  mode: 'dark',
  primary: {
    main: catppuccinMocha.mauve,
    light: catppuccinMocha.lavender,
    dark: catppuccinMocha.mauve,
    contrastText: catppuccinMocha.crust,
  },
  secondary: {
    main: catppuccinMocha.pink,
    light: catppuccinMocha.flamingo,
    dark: catppuccinMocha.maroon,
    contrastText: catppuccinMocha.crust,
  },
  error: {
    main: catppuccinMocha.red,
    light: catppuccinMocha.maroon,
    dark: catppuccinMocha.red,
  },
  warning: {
    main: catppuccinMocha.peach,
    light: catppuccinMocha.yellow,
    dark: catppuccinMocha.peach,
  },
  info: {
    main: catppuccinMocha.sapphire,
    light: catppuccinMocha.sky,
    dark: catppuccinMocha.blue,
  },
  success: {
    main: catppuccinMocha.green,
    light: catppuccinMocha.teal,
    dark: catppuccinMocha.green,
  },
  background: {
    default: catppuccinMocha.base,
    paper: catppuccinMocha.mantle,
  },
  text: {
    primary: catppuccinMocha.text,
    secondary: catppuccinMocha.subtext0,
  },
  divider: catppuccinMocha.surface0,
}

// Export the color constants for use elsewhere
export { catppuccinMocha, catppuccinLatte }
