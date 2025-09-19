import React, { createContext, useState, useContext, ReactNode } from 'react';
import { LightColors, DarkColors, ThemeType, COLOR } from '@/constants/ColorPallet';

// Create a base color interface to handle the const assertions
interface BaseColors {
  darkgray: string;
  orange: string;
  primary: string;
  secondary: string;
  accent: string;
  light: string;
  white: string;
  shadow: string;
  black: string;
  textcol: string;
}

interface ThemeContextProps {
  theme: ThemeType;
  colors: BaseColors;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextProps>({
  theme: 'light',
  colors: LightColors,
  setTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<ThemeType>('light');
  const colors = theme === 'dark' ? DarkColors : LightColors;

  return (
      <ThemeContext.Provider value={{ theme, colors, setTheme }}>
        {children}
      </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);