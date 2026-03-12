-- Script de criação do banco de dados PostgreSQL
-- Execute este script para criar as tabelas necessárias

-- Criar extensão para UUID (opcional)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabela de Usuários
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_superuser BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Configurações do Usuário
CREATE TABLE IF NOT EXISTS user_settings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    api_key_encrypted VARCHAR(500),
    api_secret_encrypted VARCHAR(500),
    paper_trading_enabled BOOLEAN DEFAULT TRUE,
    dark_mode_enabled BOOLEAN DEFAULT TRUE,
    simulated_balance INTEGER DEFAULT 1000000, -- Em centavos (R$ 10.000,00)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Estratégias
CREATE TABLE IF NOT EXISTS strategies (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(500),
    asset VARCHAR(20) NOT NULL DEFAULT 'PETR4',
    timeframe VARCHAR(10) DEFAULT '1D',
    strategy_type VARCHAR(50) DEFAULT 'ma_crossover',
    ma_short_period INTEGER DEFAULT 9,
    ma_long_period INTEGER DEFAULT 21,
    rsi_period INTEGER DEFAULT 14,
    rsi_overbought INTEGER DEFAULT 70,
    rsi_oversold INTEGER DEFAULT 30,
    macd_fast INTEGER DEFAULT 12,
    macd_slow INTEGER DEFAULT 26,
    macd_signal INTEGER DEFAULT 9,
    stop_loss_percent DECIMAL(5,2) DEFAULT 2.0,
    take_profit_percent DECIMAL(5,2) DEFAULT 4.0,
    position_size INTEGER DEFAULT 100,
    is_active BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- Tabela de Backtests
CREATE TABLE IF NOT EXISTS backtests (
    id SERIAL PRIMARY KEY,
    strategy_id INTEGER NOT NULL REFERENCES strategies(id) ON DELETE CASCADE,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_return DECIMAL(10,2) DEFAULT 0,
    win_rate DECIMAL(5,2) DEFAULT 0,
    max_drawdown DECIMAL(10,2) DEFAULT 0,
    sharpe_ratio DECIMAL(5,2) DEFAULT 0,
    total_trades INTEGER DEFAULT 0,
    winning_trades INTEGER DEFAULT 0,
    losing_trades INTEGER DEFAULT 0,
    initial_balance DECIMAL(15,2) DEFAULT 10000,
    final_balance DECIMAL(15,2) DEFAULT 10000,
    chart_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Trades
CREATE TABLE IF NOT EXISTS trades (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    strategy_id INTEGER REFERENCES strategies(id) ON DELETE SET NULL,
    asset VARCHAR(20) NOT NULL,
    order_type VARCHAR(10) NOT NULL, -- BUY, SELL
    trade_type VARCHAR(10) DEFAULT 'PAPER', -- REAL, PAPER
    quantity INTEGER NOT NULL,
    price DECIMAL(15,2) NOT NULL,
    total_value DECIMAL(15,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, EXECUTED, CANCELLED, FAILED
    profit_loss DECIMAL(15,2),
    executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs
CREATE TABLE IF NOT EXISTS logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    level VARCHAR(20) DEFAULT 'INFO', -- SUCCESS, INFO, WARNING, ERROR
    log_type VARCHAR(50) DEFAULT 'SYSTEM', -- ORDER_EXECUTED, STRATEGY_UPDATED, CONNECTION_ERROR, SYSTEM, BOT_STATUS
    message TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_executed_at ON trades(executed_at);
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
CREATE INDEX IF NOT EXISTS idx_backtests_strategy_id ON backtests(strategy_id);

-- Comentários nas tabelas
COMMENT ON TABLE users IS 'Tabela de usuários do sistema';
COMMENT ON TABLE user_settings IS 'Configurações e credenciais do usuário';
COMMENT ON TABLE strategies IS 'Estratégias de trading configuradas';
COMMENT ON TABLE backtests IS 'Resultados de backtests executados';
COMMENT ON TABLE trades IS 'Histórico de trades executados';
COMMENT ON TABLE logs IS 'Logs do sistema e do bot';
