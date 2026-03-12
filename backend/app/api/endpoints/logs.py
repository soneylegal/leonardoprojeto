"""
Endpoints de Logs
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.core.database import get_db
from app.api.endpoints.auth import get_current_user
from app.models.user import User
from app.models.log import Log
from app.schemas.schemas import LogResponse

router = APIRouter()


@router.get("/", response_model=List[LogResponse])
async def list_logs(
    limit: int = 100,
    level: str = None,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Lista logs do usuário"""
    query = select(Log).where(Log.user_id == current_user.id)
    
    if level:
        query = query.where(Log.level == level)
    
    query = query.order_by(Log.created_at.desc()).limit(limit)
    
    result = await db.execute(query)
    logs = result.scalars().all()
    
    return logs


@router.delete("/clear")
async def clear_logs(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Limpa todos os logs do usuário"""
    result = await db.execute(
        select(Log).where(Log.user_id == current_user.id)
    )
    logs = result.scalars().all()
    
    for log in logs:
        await db.delete(log)
    
    await db.commit()
    
    return {"message": "Logs limpos com sucesso"}
