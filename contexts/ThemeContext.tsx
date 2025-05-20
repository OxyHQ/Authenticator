import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

export interface Theme {
  // Base colors
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  primary: string;
  primaryDark: string;
  border: string;
  danger: string;
  success: string;
  warning: string;

  // Tab bar specific
  tabBar: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Component specific
  cardShadow: string;
  scanOverlay: string;
  scanBorder: string;
}

const lightTheme: Theme = {
  // Base colors
  background: '#f8f9fa',
  surface: '#ffffff',
  surfaceSecondary: '#f0f2f5',
  text: '#202124',
  textSecondary: '#5f6368',
  primary: '#1a73e8',
  primaryDark: '#1557b0',
  border: '#e5e5e5',
  danger: '#dc3545',
  success: '#34a853',
  warning: '#fbbc05',

  // Tab bar specific
  tabBar: '#ffffff',
  tabBarBorder: '#e5e5e5',
  tabBarActive: '#1a73e8',
  tabBarInactive: '#757575',

  // Component specific
  cardShadow: '#000000',
  scanOverlay: 'rgba(0,0,0,0.5)',
  scanBorder: '#ffffff'
};

const darkTheme: Theme = {
  // Base colors
  background: '#121212',
  surface: '#1e1e1e',
  surfaceSecondary: '#2d2d2d',
  text: '#ffffff',
  textSecondary: '#9aa0a6',
  primary: '#8ab4f8',
  primaryDark: '#669df6',
  border: '#2d2d2d',
  danger: '#f28b82',
  success: '#81c995',
  warning: '#fdd663',

  // Tab bar specific
  tabBar: '#1e1e1e',
  tabBarBorder: '#2d2d2d',
  tabBarActive: '#8ab4f8',
  tabBarInactive: '#9aa0a6',

  // Component specific
  cardShadow: '#000000',
  scanOverlay: 'rgba(0,0,0,0.7)',
  scanBorder: '#8ab4f8'
};

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme) {
        setIsDark(savedTheme === 'dark');
      }
    } catch (error) {
      console.error('Error loading theme preference:', error);
    }
  };

  const toggleTheme = async () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    try {
      await AsyncStorage.setItem('theme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Error saving theme preference:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme: isDark ? darkTheme : lightTheme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}