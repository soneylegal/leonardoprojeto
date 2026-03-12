"""
Modelo de Log
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from app.core.database import Base


class LogLevelEnum(str, enum.Enum):
    """Nível do log"""
    SUCCESS = "SUCCESS"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"


class LogTypeEnum(str, enum.Enum):
    """Tipo de log"""
    ORDER_EXECUTED = "ORDER_EXECUTED"
    STRATEGY_UPDATED = "STRATEGY_UPDATED"
    CONNECTION_ERROR = "CONNECTION_ERROR"
    SYSTEM = "SYSTEM"
    BOT_STATUS = "BOT_STATUS"


class Log(Base):
    """Modelo de log do sistema"""
    __tablename__ = "logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Informações do log
    level = Column(Enum(LogLevelEnum), default=LogLevelEnum.INFO)
    log_type = Column(Enum(LogTypeEnum), default=LogTypeEnum.SYSTEM)
    message = Column(Text, nullable=False)
    
    # Detalhes adicionais
    details = Column(Text, nullable=True)
    
    # Timestamp
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relacionamento
    user = relationship("User", back_populates="logs")
