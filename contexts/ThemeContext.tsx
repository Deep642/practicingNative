import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

// Updated ThemeContextType to include mode and setMode
export type ThemeContextType = {
  theme: {
    backgroundColor: string;
    textColor: string;
  };
  toggleTheme: () => void;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

export const ThemeContext = createContext<ThemeContextType>({
  theme: {
    backgroundColor: '#FFFFFF',
    textColor: '#000000',
  },
  toggleTheme: () => {},
  mode: 'system',
  setMode: () => {},
});

const darkTheme = {
  backgroundColor: '#000000',
  textColor: '#FFFFFF',
};

const lightTheme = {
  backgroundColor: '#FFFFFF',
  textColor: '#000000',
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('system');
  const [theme, setTheme] = useState<'light' | 'dark'>(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    if (mode === 'system') {
      const listener = Appearance.addChangeListener(({ colorScheme }) => {
        setTheme(colorScheme === 'dark' ? 'dark' : 'light');
      });
      setTheme(Appearance.getColorScheme() || 'light');
      return () => listener.remove();
    } else {
      setTheme(mode);
    }
  }, [mode]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme: theme === 'dark' ? darkTheme : lightTheme, toggleTheme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within a ThemeProvider');
  return context;
}
