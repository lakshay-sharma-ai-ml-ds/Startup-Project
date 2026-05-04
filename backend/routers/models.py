from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from pydantic import BaseModel
from typing import Optional
import sys
sys.path.append('..')
from db.database import get_db, AIModel, User, ModelStatus
from routers.auth import get_current_user

router = APIRouter()

class RegisterModelRequest(BaseModel):
    name: str
    description: Optional[str] = None
    model_type: str
    endpoint_url: Optional[str] = None
    api_key: Optional[str] = None
    registration_method: str

TIER_MODEL_LIMITS = {"free": 1, "personal": 5, "enterprise": -1}

@router.post("/register")
async def register_model(req: RegisterModelRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    limit = TIER_MODEL_LIMITS.get(user.tier, 1)
    if limit != -1 and user.models_registered >= limit:
        raise HTTPException(status_code=403, detail=f"Model limit reached for {user.tier} tier. Upgrade to register more.")
    model = AIModel(user_id=user.id, name=req.name, description=req.description,
                    model_type=req.model_type, endpoint_url=req.endpoint_url,
                    api_key_encrypted=req.api_key, status=ModelStatus.PENDING,
                    metadata_={"registration_method": req.registration_method})
    db.add(model)
    await db.execute(update(User).where(User.id == user.id).values(models_registered=user.models_registered + 1))
    await db.commit()
    await db.refresh(model)
    return {"id": model.id, "name": model.name, "status": model.status, "trust_score": model.trust_score,
            "message": "Model registered. Run an audit to begin evaluation."}

@router.get("/")
async def list_models(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).where(AIModel.user_id == user.id))
    return [{"id": m.id, "name": m.name, "model_type": m.model_type, "status": m.status,
             "trust_score": m.trust_score, "risk_level": m.risk_level,
             "last_audited": m.last_audited.isoformat() if m.last_audited else None,
             "created_at": m.created_at.isoformat()} for m in result.scalars().all()]

@router.get("/{model_id}")
async def get_model(model_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).where(AIModel.id == model_id, AIModel.user_id == user.id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    return {"id": model.id, "name": model.name, "description": model.description, "model_type": model.model_type,
            "status": model.status, "trust_score": model.trust_score, "risk_level": model.risk_level,
            "endpoint_url": model.endpoint_url,
            "last_audited": model.last_audited.isoformat() if model.last_audited else None,
            "created_at": model.created_at.isoformat(), "metadata": model.metadata_}

@router.delete("/{model_id}")
async def delete_model(model_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).where(AIModel.id == model_id, AIModel.user_id == user.id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found")
    await db.delete(model)
    await db.execute(update(User).where(User.id == user.id).values(models_registered=max(0, user.models_registered - 1)))
    await db.commit()
    return {"message": "Model deleted"}