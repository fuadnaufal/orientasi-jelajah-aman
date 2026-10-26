// src/context/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { useColorScheme as useRNColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface ThemeColors {
  background: string;
  card: string;
  surface: string;
  text: string;
  textSecondary: string;
  border: string;
  primary: string;
  primaryContainer: string;
  danger: string;
  dangerContainer: string;
  inputBackground: string;
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;
}

export const lightColors: ThemeColors = {
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#F1F5F9',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  primary: '#0284C7',
  primaryContainer: '#E0F2FE',
  danger: '#EF4444',
  dangerContainer: '#FEE2E2',
  inputBackground: '#FFFFFF',
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E2E8F0',
  tabBarActive: '#0284C7',
  tabBarInactive: '#94A3B8',
};

export const darkColors: ThemeColors = {
  background: '#0F172A',
  card: '#1E293B',
  surface: '#334155',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  primary: '#38BDF8',
  primaryContainer: '#0C4A6E',
  danger: '#F87171',
  dangerContainer: '#450A0A',
  inputBackground: '#1E293B',
  tabBarBackground: '#0F172A',
  tabBarBorder: '#1E293B',
  tabBarActive: '#38BDF8',
  tabBarInactive: '#64748B',
};

interface ThemeContextValue {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  isDark: boolean;
  colors: ThemeColors;
}

const KUNCI_TEMA = '@jelajah_aman:tema_mode';

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: 'system',
  setThemeMode: async () => {},
  isDark: false,
  colors: lightColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const systemScheme = useRNColorScheme();

  useEffect(() => {
    AsyncStorage.getItem(KUNCI_TEMA).then((saved) => {
      if (saved === 'light' || saved === 'dark' || saved === 'system') {
        setThemeModeState(saved);
      }
    }).catch(() => {});
  }, []);

  const setThemeMode = async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(KUNCI_TEMA, mode);
    } catch {}
  };

  const isDark = useMemo(() => {
    if (themeMode === 'light') return false;
    if (themeMode === 'dark') return true;
    return systemScheme === 'dark';
  }, [themeMode, systemScheme]);

  const colors = useMemo(() => {
    return isDark ? darkColors : lightColors;
  }, [isDark]);

  return (
    <ThemeContext.Provider value={{ themeMode, setThemeMode, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
