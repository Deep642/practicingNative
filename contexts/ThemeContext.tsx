import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark';
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

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

  return (
    <ThemeContext.Provider value={{ theme, mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useThemeMode must be used within a ThemeProvider');
  return context;
}
