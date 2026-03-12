/**
 * Store de Autenticação usando Zustand
 */
import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import { authService } from '../services';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    const response = await authService.login(email, password);
    const token = response.access_token;
    
    await AsyncStorage.setItem('auth_token', token);
    
    const user = await authService.getMe();
    
    set({
      token,
      user,
      isAuthenticated: true,
    });
  },

  register: async (email: string, password: string) => {
    await authService.register(email, password);
    // Após registro, fazer login automaticamente
    await get().login(email, password);
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth_token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  loadToken: async () => {
    const token = await AsyncStorage.getItem('auth_token');
    
    if (token) {
      try {
        const user = await authService.getMe();
        set({
          token,
          user,
          isAuthenticated: true,
        });
      } catch {
        await AsyncStorage.removeItem('auth_token');
        set({
          token: null,
          user: null,
          isAuthenticated: false,
        });
      }
    }
  },

  setUser: (user: User | null) => {
    set({ user });
  },
}));
