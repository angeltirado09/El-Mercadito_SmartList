import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LightTheme, DarkTheme, Theme, ThemeMode } from '../constants/theme';

// ============================================================
// Types
// ============================================================
export interface ThemeContextType {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  toggleTheme: () => void;
  setMode: (mode: ThemeMode) => void;
}

// ============================================================
// Context
// ============================================================
export const ThemeContext = createContext<ThemeContextType>({
  theme: LightTheme,
  mode: 'light',
  isDark: false,
  toggleTheme: () => {},
  setMode: () => {},
});

const THEME_STORAGE_KEY = '@theme_mode';

// ============================================================
// Provider
// ============================================================
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    // Cargar preferencia persistida del usuario
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((savedMode) => {
        if (savedMode === 'dark' || savedMode === 'light') {
          setModeState(savedMode);
        }
      })
      .catch((err) => {
        console.warn('Error al cargar la preferencia de tema:', err);
      });
  }, []);

  const setMode = async (newMode: ThemeMode) => {
    setModeState(newMode);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newMode);
    } catch (err) {
      console.warn('Error al guardar la preferencia de tema:', err);
    }
  };

  const toggleTheme = () => {
    const nextMode = mode === 'light' ? 'dark' : 'light';
    setMode(nextMode);
  };

  const isDark = mode === 'dark';
  const theme = isDark ? DarkTheme : LightTheme;

  return (
    <ThemeContext.Provider value={{ theme, mode, isDark, toggleTheme, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================
// Hook consumidor
// ============================================================
export function useTheme() {
  return useContext(ThemeContext);
}
