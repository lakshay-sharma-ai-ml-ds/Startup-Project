from fastapi import APIRouter, HTTPException, Depends, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime, timedelta
import random, sys
sys.path.append('..')
from db.database import get_db, AIModel, DriftRecord, User
from routers.auth import get_current_user

router = APIRouter()

@router.post("/{model_id}/simulate")
async def simulate_drift(model_id: str, background_tasks: BackgroundTasks, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    mr = await db.execute(select(AIModel).where(AIModel.id == model_id, AIModel.user_id == user.id))
    model = mr.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    base_score = model.trust_score or 75.0
    now = datetime.utcnow()
    for i in range(30):
        noise = random.gauss(0, 2)
        trend = -0.3 * i if i > 20 else 0
        score = max(0, min(100, base_score + noise + trend))
        drift = abs(noise + trend) > 5
        db.add(DriftRecord(model_id=model_id, timestamp=now - timedelta(days=29 - i),
                           trust_score=round(score, 1), accuracy_delta=round(random.gauss(0, 1.5), 2),
                           behavior_drift=round(abs(noise) / 10, 3), performance_delta=round(random.gauss(0, 1), 2),
                           drift_detected=drift, drift_severity="none" if not drift else random.choice(["low","medium","high"])))
    await db.commit()
    return {"message": f"Generated 30 days of drift data for {model.name}"}

@router.get("/{model_id}/history")
async def get_drift_history(model_id: str, days: int = 30, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    mr = await db.execute(select(AIModel).where(AIModel.id == model_id, AIModel.user_id == user.id))
    if not mr.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Model not found")
    since = datetime.utcnow() - timedelta(days=days)
    result = await db.execute(select(DriftRecord).where(DriftRecord.model_id == model_id, DriftRecord.timestamp >= since).order_by(DriftRecord.timestamp.asc()))
    return [{"timestamp": r.timestamp.isoformat(), "trust_score": r.trust_score, "accuracy_delta": r.accuracy_delta,
             "behavior_drift": r.behavior_drift, "performance_delta": r.performance_delta,
             "drift_detected": r.drift_detected, "drift_severity": r.drift_severity} for r in result.scalars().all()]