"""
Configurações da aplicação
"""
from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    """Configurações do aplicativo carregadas de variáveis de ambiente"""
    
    # Banco de Dados
    database_url: str = "postgresql://user:password@localhost:5432/trading_bot"
    
    # MetaTrader5
    mt5_login: int = 0
    mt5_password: str = ""
    mt5_server: str = ""
    
    # Segurança
    secret_key: str = "sua_chave_secreta_muito_segura_aqui"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Modo de Execução
    debug: bool = True
    paper_trading: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


@lru_cache()
def get_settings() -> Settings:
    """Retorna instância cacheada das configurações"""
    return Settings()


settings = get_settings()
