# API module
from fastapi import APIRouter
from app.api.endpoints import dashboard, strategy, backtest, trades, logs, settings, auth

router = APIRouter()

router.include_router(auth.router, prefix="/auth", tags=["Autenticação"])
router.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
router.include_router(strategy.router, prefix="/strategies", tags=["Estratégias"])
router.include_router(backtest.router, prefix="/backtest", tags=["Backtesting"])
router.include_router(trades.router, prefix="/trades", tags=["Trades"])
router.include_router(logs.router, prefix="/logs", tags=["Logs"])
router.include_router(settings.router, prefix="/settings", tags=["Configurações"])
