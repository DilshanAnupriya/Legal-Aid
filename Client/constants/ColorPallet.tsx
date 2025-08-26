export const LightColors = {
  darkgray: '#bdc3c7',
  orange: '#d35400',
  primary: '#1c2f42ff',
  secondary: '#2c353eff',
  accent: '#e67e22',
  light: '#ecf0f1',
  white: '#ffffff',
  shadow: 'rgba(0,0,0,0.1)',
  black: '#000000',
} as const;

export const DarkColors = {
  darkgray: '#2c2c2c',
  orange: '#d35400',
  primary: '#121212',
  secondary: '#1c1c1c',
  accent: '#e67e22',
  light: '#1f1f1f',
  white: '#ffffff',
  shadow: 'rgba(255,255,255,0.1)',
  black: '#ffffff',
} as const;

export type ColorTypes = keyof typeof LightColors;
export type ThemeType = 'light' | 'dark';

export const COLOR = {
  light: LightColors,
  dark: DarkColors,
} as const;
