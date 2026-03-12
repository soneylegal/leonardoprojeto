"""
Gerenciador do Bot de Trading
"""
import asyncio
from typing import Optional
from datetime import datetime

from app.services.metatrader_service import MetaTrader5Service
from app.services.technical_analysis_service import TechnicalAnalysisService


class BotManager:
    """Gerencia o ciclo de vida e execução do bot de trading"""
    
    def __init__(self):
        self.is_running = False
        self.user_id: Optional[int] = None
        self.mt5_service = MetaTrader5Service()
        self.ta_service = TechnicalAnalysisService()
        self._task: Optional[asyncio.Task] = None
    
    async def start(self, user_id: int):
        """Inicia o bot de trading"""
        if self.is_running:
            return
        
        self.user_id = user_id
        self.is_running = True
        
        # Conectar ao MT5
        await self.mt5_service.connect()
        
        # Iniciar loop de trading
        self._task = asyncio.create_task(self._trading_loop())
        
        print(f"🤖 Bot iniciado para usuário {user_id}")
    
    async def stop(self):
        """Para o bot de trading"""
        if not self.is_running:
            return
        
        self.is_running = False
        
        # Cancelar task
        if self._task:
            self._task.cancel()
            try:
                await self._task
            except asyncio.CancelledError:
                pass
        
        # Desconectar do MT5
        await self.mt5_service.disconnect()
        
        print("🛑 Bot parado")
    
    async def _trading_loop(self):
        """Loop principal de trading"""
        while self.is_running:
            try:
                # TODO: Implementar lógica de trading
                # 1. Obter dados atuais do ativo
                # 2. Calcular indicadores
                # 3. Verificar sinais
                # 4. Executar ordens se necessário
                # 5. Gerenciar posições abertas
                
                await asyncio.sleep(60)  # Verificar a cada 1 minuto
                
            except asyncio.CancelledError:
                break
            except Exception as e:
                print(f"❌ Erro no loop de trading: {e}")
                await asyncio.sleep(5)
    
    @property
    def status(self) -> str:
        """Retorna status atual do bot"""
        if self.is_running:
            return "Running"
        return "Stopped"
