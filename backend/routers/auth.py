from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from pydantic import BaseModel, EmailStr
import bcrypt
from jose import JWTError, jwt
from datetime import datetime, timedelta
import uuid, os, sys
sys.path.append('..')
from db.database import get_db, User, UserTier

router = APIRouter()
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")

SECRET_KEY = os.getenv("SECRET_KEY", "ai-sheriff-super-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    company_name: str = None
    tier: str = "free"

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

def create_access_token(data: dict):
    to_encode = data.copy()
    to_encode.update({"exp": datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@router.post("/register", response_model=TokenResponse)
async def register(req: RegisterRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == req.email))
    if result.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Email already registered")
    auth_key = f"SHERIFF-{str(uuid.uuid4()).upper().replace('-','')[:16]}"
    user = User(
        email=req.email,
        hashed_password=hash_password(req.password),
        full_name=req.full_name,
        company_name=req.company_name,
        tier=UserTier(req.tier) if req.tier in ["free","personal","enterprise"] else UserTier.FREE,
        auth_key=auth_key,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "company_name": user.company_name, "tier": user.tier, "auth_key": user.auth_key,
        "trial_start": user.trial_start.isoformat() if user.trial_start else None,
    }}

@router.post("/login", response_model=TokenResponse)
async def login(form_data: OAuth2PasswordRequestForm = Depends(), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == form_data.username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": user.id})
    return {"access_token": token, "token_type": "bearer", "user": {
        "id": user.id, "email": user.email, "full_name": user.full_name,
        "company_name": user.company_name, "tier": user.tier, "auth_key": user.auth_key,
        "trial_start": user.trial_start.isoformat() if user.trial_start else None,
    }}

@router.get("/me")
async def me(user: User = Depends(get_current_user)):
    return {"id": user.id, "email": user.email, "full_name": user.full_name,
            "company_name": user.company_name, "tier": user.tier, "auth_key": user.auth_key,
            "models_registered": user.models_registered,
            "trial_start": user.trial_start.isoformat() if user.trial_start else None}

@router.get("/pricing")
async def get_pricing():
    return {
        "free": {"price": 0, "label": "Free Trial", "features": ["1 AI model","50 adversarial tests","EU AI Act snapshot","Trust score dashboard"], "limits": {"models": 1, "audits_per_month": 50}},
        "personal": {"price_monthly": 29, "label": "Personal", "features": ["Up to 5 models","500 tests/month","All 3 frameworks","Drift monitoring","Evidence packs","Trust Badge"], "limits": {"models": 5, "audits_per_month": 500}},
        "enterprise": {"price_monthly": 299, "label": "Enterprise", "features": ["Unlimited models","Unlimited auditing","All frameworks","Agentic AI tracing","Regulator packs","Dedicated analyst"], "limits": {"models": -1, "audits_per_month": -1}},
    }