/**
 * Store de Tema usando Zustand
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeStore {
  isDarkMode: boolean;
  toggleTheme: () => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  isDarkMode: true,

  toggleTheme: async () => {
    const newValue = !get().isDarkMode;
    await AsyncStorage.setItem('dark_mode', JSON.stringify(newValue));
    set({ isDarkMode: newValue });
  },

  loadTheme: async () => {
    const stored = await AsyncStorage.getItem('dark_mode');
    if (stored !== null) {
      set({ isDarkMode: JSON.parse(stored) });
    }
  },
}));

// Cores do tema
export const darkTheme = {
  background: '#0a0a0f',
  surface: '#1a1a2e',
  card: '#16213e',
  primary: '#0077ff',
  secondary: '#00d4aa',
  accent: '#ff6b6b',
  text: '#ffffff',
  textSecondary: '#a0a0a0',
  border: '#2a2a4e',
  success: '#00d4aa',
  error: '#ff6b6b',
  warning: '#ffa726',
  info: '#29b6f6',
  buyColor: '#00d4aa',
  sellColor: '#ff6b6b',
  chartGreen: '#26a69a',
  chartRed: '#ef5350',
};

export const lightTheme = {
  background: '#f5f5f5',
  surface: '#ffffff',
  card: '#ffffff',
  primary: '#0077ff',
  secondary: '#00b894',
  accent: '#e74c3c',
  text: '#1a1a2e',
  textSecondary: '#666666',
  border: '#e0e0e0',
  success: '#00b894',
  error: '#e74c3c',
  warning: '#f39c12',
  info: '#3498db',
  buyColor: '#00b894',
  sellColor: '#e74c3c',
  chartGreen: '#26a69a',
  chartRed: '#ef5350',
};

export const getTheme = (isDarkMode: boolean) => isDarkMode ? darkTheme : lightTheme;
