"""
Modelo de Backtest
"""
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.core.database import Base


class Backtest(Base):
    """Modelo de resultado de backtesting"""
    __tablename__ = "backtests"
    
    id = Column(Integer, primary_key=True, index=True)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=False)
    
    # Período do backtest
    start_date = Column(DateTime(timezone=True), nullable=False)
    end_date = Column(DateTime(timezone=True), nullable=False)
    
    # Métricas de Performance
    total_return = Column(Float, default=0.0)  # Retorno total em %
    win_rate = Column(Float, default=0.0)  # Taxa de acerto em %
    max_drawdown = Column(Float, default=0.0)  # Drawdown máximo em %
    sharpe_ratio = Column(Float, default=0.0)  # Índice de Sharpe
    
    # Estatísticas de Trades
    total_trades = Column(Integer, default=0)
    winning_trades = Column(Integer, default=0)
    losing_trades = Column(Integer, default=0)
    
    # Valores
    initial_balance = Column(Float, default=10000.0)
    final_balance = Column(Float, default=10000.0)
    
    # Dados do gráfico (JSON com pontos de compra/venda)
    chart_data = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamento
    strategy = relationship("Strategy", back_populates="backtests")
