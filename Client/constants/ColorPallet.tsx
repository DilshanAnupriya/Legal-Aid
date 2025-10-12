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
  textcol : '#ffffff',
  blue: '#3498db',
  darkblue: '#1C2F42',
  success :'#048607ff',
  danger:"red"
} as const;

export const DarkColors = {
  darkgray: '#6a6a6aff',
  orange: '#d35400',
  primary: '#ffffff', // Light text for dark theme
  secondary: '#3c3b54ff',
  accent: '#e67e22',
  light: '#16172dff', // Dark background
  white: '#17152fff', // Dark surface color
  shadow: 'rgba(255,255,255,0.1)',
  black: '#000000ff',
  textcol: '#ffffff',
  success :'#048607ff',
  danger:"red",
  darkblue: '#1C2F42'
} as const;

export type ColorTypes = keyof typeof LightColors;
export type ThemeType = 'light' | 'dark';

export const COLOR = {
  light: LightColors,
  dark: DarkColors,
} as const;