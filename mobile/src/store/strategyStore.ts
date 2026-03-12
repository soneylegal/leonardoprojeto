/**
 * Store de Estratégia usando Zustand
 */
import { create } from 'zustand';
import { Strategy, StrategyFormData, Asset } from '../types';
import { strategyService } from '../services';

interface StrategyStore {
  strategies: Strategy[];
  currentStrategy: Strategy | null;
  availableAssets: Asset[];
  isLoading: boolean;
  error: string | null;
  
  loadStrategies: () => Promise<void>;
  loadAssets: () => Promise<void>;
  createStrategy: (data: StrategyFormData) => Promise<Strategy>;
  updateStrategy: (id: number, data: Partial<StrategyFormData>) => Promise<void>;
  deleteStrategy: (id: number) => Promise<void>;
  setCurrentStrategy: (strategy: Strategy | null) => void;
}

export const useStrategyStore = create<StrategyStore>((set, get) => ({
  strategies: [],
  currentStrategy: null,
  availableAssets: [],
  isLoading: false,
  error: null,

  loadStrategies: async () => {
    set({ isLoading: true, error: null });
    try {
      const strategies = await strategyService.list();
      set({ strategies, isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  loadAssets: async () => {
    try {
      const assets = await strategyService.getAvailableAssets();
      set({ availableAssets: assets });
    } catch (error: any) {
      console.error('Erro ao carregar ativos:', error);
    }
  },

  createStrategy: async (data: StrategyFormData) => {
    set({ isLoading: true, error: null });
    try {
      const newStrategy = await strategyService.create(data);
      set((state) => ({
        strategies: [...state.strategies, newStrategy],
        isLoading: false,
      }));
      return newStrategy;
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  updateStrategy: async (id: number, data: Partial<StrategyFormData>) => {
    set({ isLoading: true, error: null });
    try {
      const updated = await strategyService.update(id, data);
      set((state) => ({
        strategies: state.strategies.map((s) => (s.id === id ? updated : s)),
        currentStrategy: state.currentStrategy?.id === id ? updated : state.currentStrategy,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  deleteStrategy: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await strategyService.delete(id);
      set((state) => ({
        strategies: state.strategies.filter((s) => s.id !== id),
        currentStrategy: state.currentStrategy?.id === id ? null : state.currentStrategy,
        isLoading: false,
      }));
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
      throw error;
    }
  },

  setCurrentStrategy: (strategy: Strategy | null) => {
    set({ currentStrategy: strategy });
  },
}));
