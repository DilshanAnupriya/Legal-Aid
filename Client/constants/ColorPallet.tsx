export const COLOR = {
    darkgray: '#bdc3c7',
    orange: '#d35400',
    primary: '#2c3e50',
    secondary: '#34495e',
    accent: '#e67e22',
    light: '#ecf0f1',
    white: '#ffffff',
    shadow: 'rgba(0, 0, 0, 0.1)',
    black: '#000000',
} as const;

export  type ColorTypes = keyof typeof COLOR;