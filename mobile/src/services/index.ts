/**
 * Serviços de API
 */
import api from './api';
import {
  User,
  Settings,
  Strategy,
  StrategyFormData,
  Trade,
  Position,
  BacktestResult,
  LogEntry,
  DashboardData,
  ChartResponseData,
  Asset,
} from '../types';

// ================= AUTH =================

export const authService = {
  async login(email: string, password: string): Promise<{ access_token: string }> {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);
    
    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  async register(email: string, password: string): Promise<User> {
    const response = await api.post('/auth/register', { email, password });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get('/auth/me');
    return response.data;
  },
};

// ================= DASHBOARD =================

export const dashboardService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get('/dashboard/');
    return response.data;
  },

  async startBot(): Promise<{ status: string; message: string }> {
    const response = await api.post('/dashboard/bot/start');
    return response.data;
  },

  async stopBot(): Promise<{ status: string; message: string }> {
    const response = await api.post('/dashboard/bot/stop');
    return response.data;
  },

  async getChartData(asset: string, timeframe: string = '1D'): Promise<ChartResponseData> {
    const response = await api.get(`/dashboard/chart/${asset}`, {
      params: { timeframe },
    });
    return response.data;
  },
};

// ================= STRATEGY =================

export const strategyService = {
  async list(): Promise<Strategy[]> {
    const response = await api.get('/strategies/');
    return response.data;
  },

  async create(data: StrategyFormData): Promise<Strategy> {
    const response = await api.post('/strategies/', data);
    return response.data;
  },

  async get(id: number): Promise<Strategy> {
    const response = await api.get(`/strategies/${id}`);
    return response.data;
  },

  async update(id: number, data: Partial<StrategyFormData>): Promise<Strategy> {
    const response = await api.put(`/strategies/${id}`, data);
    return response.data;
  },

  async delete(id: number): Promise<void> {
    await api.delete(`/strategies/${id}`);
  },

  async getAvailableAssets(): Promise<Asset[]> {
    const response = await api.get('/strategies/assets/available');
    return response.data;
  },
};

// ================= TRADES =================

export const tradeService = {
  async list(limit: number = 50): Promise<Trade[]> {
    const response = await api.get('/trades/', { params: { limit } });
    return response.data;
  },

  async executePaperTrade(
    asset: string,
    orderType: 'BUY' | 'SELL',
    quantity: number,
    price: number
  ): Promise<Trade> {
    const response = await api.post('/trades/paper', {
      asset,
      order_type: orderType,
      quantity,
      price,
    });
    return response.data;
  },

  async getPositions(): Promise<Position[]> {
    const response = await api.get('/trades/positions');
    return response.data;
  },

  async getBalance(): Promise<{ simulated_balance: number; currency: string }> {
    const response = await api.get('/trades/balance');
    return response.data;
  },
};

// ================= BACKTEST =================

export const backtestService = {
  async run(strategyId: number, period: string = '1Y'): Promise<BacktestResult> {
    const response = await api.post('/backtest/run', {
      strategy_id: strategyId,
      period,
    });
    return response.data;
  },

  async getHistory(strategyId?: number): Promise<BacktestResult[]> {
    const response = await api.get('/backtest/history', {
      params: { strategy_id: strategyId },
    });
    return response.data;
  },

  async get(id: number): Promise<BacktestResult> {
    const response = await api.get(`/backtest/${id}`);
    return response.data;
  },
};

// ================= LOGS =================

export const logService = {
  async list(limit: number = 100, level?: string): Promise<LogEntry[]> {
    const response = await api.get('/logs/', {
      params: { limit, level },
    });
    return response.data;
  },

  async clear(): Promise<void> {
    await api.delete('/logs/clear');
  },
};

// ================= SETTINGS =================

export const settingsService = {
  async get(): Promise<Settings> {
    const response = await api.get('/settings/');
    return response.data;
  },

  async update(data: Partial<Settings & { api_key?: string; api_secret?: string }>): Promise<Settings> {
    const response = await api.put('/settings/', data);
    return response.data;
  },

  async testConnection(): Promise<{ status: string; message: string }> {
    const response = await api.post('/settings/test-connection');
    return response.data;
  },

  async resetBalance(): Promise<{ status: string; message: string }> {
    const response = await api.post('/settings/reset-balance');
    return response.data;
  },
};
