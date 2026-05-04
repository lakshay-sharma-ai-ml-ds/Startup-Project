from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
import sys
sys.path.append('..')
from db.database import get_db, Alert, User
from routers.auth import get_current_user

router = APIRouter()

@router.get("/")
async def get_alerts(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Alert).where(Alert.user_id == user.id).order_by(Alert.created_at.desc()).limit(50))
    return [{"id": a.id, "model_id": a.model_id, "alert_type": a.alert_type, "severity": a.severity,
             "title": a.title, "message": a.message, "is_read": a.is_read,
             "created_at": a.created_at.isoformat()} for a in result.scalars().all()]

@router.post("/{alert_id}/read")
async def mark_read(alert_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    await db.execute(update(Alert).where(Alert.id == alert_id, Alert.user_id == user.id).values(is_read=True))
    await db.commit()
    return {"message": "Alert marked as read"}