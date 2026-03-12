"""
Modelo de Trade (Operação)
"""
from sqlalchemy import Column, Integer, Float, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class OrderTypeEnum(str, enum.Enum):
    """Tipo de ordem"""
    BUY = "BUY"
    SELL = "SELL"


class OrderStatusEnum(str, enum.Enum):
    """Status da ordem"""
    PENDING = "PENDING"
    EXECUTED = "EXECUTED"
    CANCELLED = "CANCELLED"
    FAILED = "FAILED"


class TradeTypeEnum(str, enum.Enum):
    """Tipo de trade"""
    REAL = "REAL"
    PAPER = "PAPER"


class Trade(Base):
    """Modelo de trade/operação"""
    __tablename__ = "trades"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    strategy_id = Column(Integer, ForeignKey("strategies.id"), nullable=True)
    
    # Identificação
    asset = Column(String(20), nullable=False)
    order_type = Column(Enum(OrderTypeEnum), nullable=False)
    trade_type = Column(Enum(TradeTypeEnum), default=TradeTypeEnum.PAPER)
    
    # Valores
    quantity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    total_value = Column(Float, nullable=False)
    
    # Status
    status = Column(Enum(OrderStatusEnum), default=OrderStatusEnum.PENDING)
    
    # Resultado (para trades fechados)
    profit_loss = Column(Float, nullable=True)
    
    # Timestamps
    executed_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamentos
    user = relationship("User", back_populates="trades")
    strategy = relationship("Strategy", back_populates="trades")
