from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, JSON, Enum as SAEnum
from datetime import datetime
import uuid
import enum
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./ai_sheriff.db")

engine = create_async_engine(DATABASE_URL, echo=False)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
Base = declarative_base()

class UserTier(str, enum.Enum):
    FREE = "free"
    PERSONAL = "personal"
    ENTERPRISE = "enterprise"

class ModelStatus(str, enum.Enum):
    PENDING = "pending"
    AUDITING = "auditing"
    ACTIVE = "active"
    FLAGGED = "flagged"

class User(Base):
    __tablename__ = "users"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    company_name = Column(String)
    tier = Column(SAEnum(UserTier), default=UserTier.FREE)
    auth_key = Column(String, unique=True, default=lambda: f"SHERIFF-{str(uuid.uuid4()).upper()}")
    trial_start = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    models_registered = Column(Integer, default=0)

class AIModel(Base):
    __tablename__ = "ai_models"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    model_type = Column(String)
    endpoint_url = Column(String)
    api_key_encrypted = Column(String)
    status = Column(SAEnum(ModelStatus), default=ModelStatus.PENDING)
    trust_score = Column(Float, default=0.0)
    risk_level = Column(String, default="Not Yet Audited")
    last_audited = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)
    metadata_ = Column(JSON, default={})

class AuditResult(Base):
    __tablename__ = "audit_results"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String, nullable=False)
    test_type = Column(String)
    total_tests = Column(Integer, default=0)
    passed = Column(Integer, default=0)
    failed = Column(Integer, default=0)
    bias_score = Column(Float, default=0.0)
    hallucination_score = Column(Float, default=0.0)
    toxicity_score = Column(Float, default=0.0)
    jailbreak_resistance = Column(Float, default=0.0)
    adversarial_score = Column(Float, default=0.0)
    detailed_results = Column(JSON, default={})
    created_at = Column(DateTime, default=datetime.utcnow)

class ComplianceResult(Base):
    __tablename__ = "compliance_results"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String, nullable=False)
    eu_ai_act_score = Column(Float, default=0.0)
    nist_rmf_score = Column(Float, default=0.0)
    india_dpdp_score = Column(Float, default=0.0)
    overall_compliance = Column(Float, default=0.0)
    framework_details = Column(JSON, default={})
    evidence_pack_url = Column(String)
    gaps = Column(JSON, default=[])
    created_at = Column(DateTime, default=datetime.utcnow)

class DriftRecord(Base):
    __tablename__ = "drift_records"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    trust_score = Column(Float)
    accuracy_delta = Column(Float, default=0.0)
    behavior_drift = Column(Float, default=0.0)
    performance_delta = Column(Float, default=0.0)
    drift_detected = Column(Boolean, default=False)
    drift_severity = Column(String, default="none")

class Alert(Base):
    __tablename__ = "alerts"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    model_id = Column(String, nullable=False)
    user_id = Column(String, nullable=False)
    alert_type = Column(String)
    severity = Column(String)
    title = Column(String)
    message = Column(Text)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()