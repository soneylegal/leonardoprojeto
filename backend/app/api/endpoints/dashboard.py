"""
Endpoints do Dashboard
"""
from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_
from datetime import datetime, timedelta

from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.trade import Trade
from app.models.strategy import Strategy
from app.schemas.schemas import DashboardResponse, BotStatus, TradeResponse, ChartResponse

router = APIRouter()


@router.get("/", response_model=DashboardResponse)
async def get_dashboard(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Retorna dados do dashboard principal"""
    
    # Verificar status do bot
    bot_manager = request.app.state.bot_manager
    is_running = bot_manager.is_running if bot_manager else False
    
    # Calcular P/L do dia
    today = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
    result = await db.execute(
        select(Trade).where(
            and_(
                Trade.user_id == current_user.id,
                Trade.executed_at >= today
            )
        ).order_by(Trade.executed_at.desc())
    )
    todays_trades = result.scalars().all()
    
    todays_pnl = sum(t.profit_loss or 0 for t in todays_trades)
    
    # Último trade
    last_trade = todays_trades[0] if todays_trades else None
    
    # Obter estratégia ativa para saber o ativo atual
    result = await db.execute(
        select(Strategy).where(
            and_(
                Strategy.user_id == current_user.id,
                Strategy.is_active == True
            )
        )
    )
    active_strategy = result.scalar_one_or_none()
    asset = active_strategy.asset if active_strategy else "PETR4"
    
    # Preço atual (simulado por enquanto)
    current_price = 25.50  # Será substituído por dados reais do MT5
    
    return DashboardResponse(
        bot_status=BotStatus(
            is_running=is_running,
            status_text="Running" if is_running else "Stopped"
        ),
        todays_pnl=todays_pnl,
        last_trade=TradeResponse.model_validate(last_trade) if last_trade else None,
        current_price=current_price,
        asset=asset
    )


@router.post("/bot/start")
async def start_bot(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Inicia o bot de trading"""
    bot_manager = request.app.state.bot_manager
    await bot_manager.start(current_user.id)
    
    return {"status": "started", "message": "Bot iniciado com sucesso"}


@router.post("/bot/stop")
async def stop_bot(
    request: Request,
    current_user: User = Depends(get_current_user)
):
    """Para o bot de trading"""
    bot_manager = request.app.state.bot_manager
    await bot_manager.stop()
    
    return {"status": "stopped", "message": "Bot parado com sucesso"}


@router.get("/chart/{asset}", response_model=ChartResponse)
async def get_chart_data(
    asset: str,
    timeframe: str = "1D",
    current_user: User = Depends(get_current_user)
):
    """Retorna dados do gráfico para um ativo"""
    # Por enquanto, retorna dados simulados
    # Será integrado com MT5 posteriormente
    
    from datetime import datetime
    import random
    
    candles = []
    base_price = 25.0
    ma_short = []
    ma_long = []
    
    for i in range(100):
        open_price = base_price + random.uniform(-0.5, 0.5)
        close_price = open_price + random.uniform(-1, 1)
        high = max(open_price, close_price) + random.uniform(0, 0.5)
        low = min(open_price, close_price) - random.uniform(0, 0.5)
        
        candles.append({
            "timestamp": datetime.now() - timedelta(days=100-i),
            "open": round(open_price, 2),
            "high": round(high, 2),
            "low": round(low, 2),
            "close": round(close_price, 2),
            "volume": random.randint(1000000, 5000000)
        })
        
        base_price = close_price
        ma_short.append(round(base_price + random.uniform(-0.3, 0.3), 2))
        ma_long.append(round(base_price + random.uniform(-0.5, 0.5), 2))
    
    return ChartResponse(
        asset=asset,
        timeframe=timeframe,
        candles=candles,
        ma_short=ma_short,
        ma_long=ma_long
    )
