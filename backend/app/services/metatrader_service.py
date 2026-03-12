"""
Serviço de integração com MetaTrader5
"""
import asyncio
from typing import Optional, List, Dict
from datetime import datetime, timedelta
import pandas as pd

# Importação condicional do MT5 (só funciona no Windows)
try:
    import MetaTrader5 as mt5
    MT5_AVAILABLE = True
except ImportError:
    MT5_AVAILABLE = False
    mt5 = None

from app.core.config import settings


class MetaTrader5Service:
    """Serviço para conexão e operações com MetaTrader5"""
    
    def __init__(self):
        self.connected = False
        self.login = settings.mt5_login
        self.password = settings.mt5_password
        self.server = settings.mt5_server
    
    async def connect(self) -> bool:
        """Estabelece conexão com o MetaTrader5"""
        if not MT5_AVAILABLE:
            print("⚠️ MetaTrader5 não disponível neste sistema")
            return False
        
        # Inicializar MT5
        if not mt5.initialize():
            print(f"❌ Falha ao inicializar MT5: {mt5.last_error()}")
            return False
        
        # Login na conta
        if self.login and self.password and self.server:
            authorized = mt5.login(
                login=self.login,
                password=self.password,
                server=self.server
            )
            
            if not authorized:
                print(f"❌ Falha no login MT5: {mt5.last_error()}")
                return False
        
        self.connected = True
        print("✅ Conectado ao MetaTrader5")
        return True
    
    async def disconnect(self):
        """Encerra conexão com o MetaTrader5"""
        if MT5_AVAILABLE and self.connected:
            mt5.shutdown()
            self.connected = False
            print("🔌 Desconectado do MetaTrader5")
    
    async def get_symbol_info(self, symbol: str) -> Optional[Dict]:
        """Obtém informações de um ativo"""
        if not MT5_AVAILABLE or not self.connected:
            # Retorna dados simulados
            return {
                "symbol": symbol,
                "bid": 25.48,
                "ask": 25.52,
                "last": 25.50,
                "volume": 1500000,
                "time": datetime.now()
            }
        
        symbol_info = mt5.symbol_info(symbol)
        if symbol_info is None:
            return None
        
        tick = mt5.symbol_info_tick(symbol)
        
        return {
            "symbol": symbol,
            "bid": tick.bid,
            "ask": tick.ask,
            "last": tick.last,
            "volume": tick.volume,
            "time": datetime.fromtimestamp(tick.time)
        }
    
    async def get_historical_data(
        self,
        symbol: str,
        timeframe: str,
        start_date: datetime,
        end_date: datetime
    ) -> pd.DataFrame:
        """Obtém dados históricos de um ativo"""
        
        # Mapear timeframe para constante MT5
        timeframe_map = {
            "1M": mt5.TIMEFRAME_M1 if MT5_AVAILABLE else 1,
            "5M": mt5.TIMEFRAME_M5 if MT5_AVAILABLE else 5,
            "1H": mt5.TIMEFRAME_H1 if MT5_AVAILABLE else 60,
            "1D": mt5.TIMEFRAME_D1 if MT5_AVAILABLE else 1440
        }
        
        tf = timeframe_map.get(timeframe, timeframe_map["1D"])
        
        if not MT5_AVAILABLE or not self.connected:
            # Retorna dados simulados para desenvolvimento
            return self._generate_mock_data(symbol, start_date, end_date, timeframe)
        
        # Obter dados do MT5
        rates = mt5.copy_rates_range(symbol, tf, start_date, end_date)
        
        if rates is None or len(rates) == 0:
            return pd.DataFrame()
        
        df = pd.DataFrame(rates)
        df['time'] = pd.to_datetime(df['time'], unit='s')
        df.set_index('time', inplace=True)
        
        return df
    
    def _generate_mock_data(
        self,
        symbol: str,
        start_date: datetime,
        end_date: datetime,
        timeframe: str
    ) -> pd.DataFrame:
        """Gera dados simulados para desenvolvimento"""
        import numpy as np
        
        # Calcular número de períodos
        delta = end_date - start_date
        
        if timeframe == "1D":
            periods = delta.days
            freq = 'D'
        elif timeframe == "1H":
            periods = delta.days * 24
            freq = 'H'
        elif timeframe == "5M":
            periods = delta.days * 24 * 12
            freq = '5min'
        else:
            periods = delta.days * 24 * 60
            freq = '1min'
        
        periods = min(periods, 1000)  # Limitar para não sobrecarregar
        
        dates = pd.date_range(start=start_date, periods=periods, freq=freq)
        
        # Gerar preços com movimento browniano
        np.random.seed(42)
        initial_price = 25.0
        returns = np.random.normal(0.0002, 0.02, periods)
        prices = initial_price * np.cumprod(1 + returns)
        
        # Criar OHLCV
        df = pd.DataFrame(index=dates)
        df['close'] = prices
        df['open'] = df['close'].shift(1).fillna(initial_price)
        df['high'] = df[['open', 'close']].max(axis=1) * (1 + np.abs(np.random.normal(0, 0.005, periods)))
        df['low'] = df[['open', 'close']].min(axis=1) * (1 - np.abs(np.random.normal(0, 0.005, periods)))
        df['tick_volume'] = np.random.randint(100000, 5000000, periods)
        df['spread'] = np.random.randint(1, 5, periods)
        df['real_volume'] = df['tick_volume']
        
        return df
    
    async def place_order(
        self,
        symbol: str,
        order_type: str,
        volume: float,
        price: float = None,
        sl: float = None,
        tp: float = None
    ) -> Dict:
        """Envia uma ordem para o mercado"""
        
        if not MT5_AVAILABLE or not self.connected:
            # Simular execução de ordem
            return {
                "success": True,
                "order_id": 123456,
                "symbol": symbol,
                "type": order_type,
                "volume": volume,
                "price": price or 25.50,
                "message": "Ordem simulada executada"
            }
        
        # Preparar requisição de ordem
        symbol_info = mt5.symbol_info(symbol)
        if symbol_info is None:
            return {"success": False, "message": f"Ativo {symbol} não encontrado"}
        
        if not symbol_info.visible:
            if not mt5.symbol_select(symbol, True):
                return {"success": False, "message": f"Não foi possível selecionar {symbol}"}
        
        # Definir tipo de ordem
        if order_type == "BUY":
            trade_type = mt5.ORDER_TYPE_BUY
            price = price or mt5.symbol_info_tick(symbol).ask
        else:
            trade_type = mt5.ORDER_TYPE_SELL
            price = price or mt5.symbol_info_tick(symbol).bid
        
        request = {
            "action": mt5.TRADE_ACTION_DEAL,
            "symbol": symbol,
            "volume": volume,
            "type": trade_type,
            "price": price,
            "deviation": 10,
            "magic": 123456,
            "comment": "Trading Bot Order",
            "type_time": mt5.ORDER_TIME_GTC,
            "type_filling": mt5.ORDER_FILLING_IOC,
        }
        
        if sl:
            request["sl"] = sl
        if tp:
            request["tp"] = tp
        
        result = mt5.order_send(request)
        
        if result.retcode != mt5.TRADE_RETCODE_DONE:
            return {
                "success": False,
                "message": f"Erro na ordem: {result.comment}"
            }
        
        return {
            "success": True,
            "order_id": result.order,
            "symbol": symbol,
            "type": order_type,
            "volume": volume,
            "price": result.price,
            "message": "Ordem executada com sucesso"
        }
    
    async def get_positions(self) -> List[Dict]:
        """Obtém posições abertas"""
        if not MT5_AVAILABLE or not self.connected:
            return []
        
        positions = mt5.positions_get()
        
        if positions is None:
            return []
        
        return [
            {
                "ticket": pos.ticket,
                "symbol": pos.symbol,
                "type": "BUY" if pos.type == 0 else "SELL",
                "volume": pos.volume,
                "price_open": pos.price_open,
                "price_current": pos.price_current,
                "profit": pos.profit
            }
            for pos in positions
        ]
