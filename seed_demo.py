#!/usr/bin/env python3
"""
AI Sheriff Demo Seed Script
Populates the database with realistic demo data for investor demos,
sales calls, and testing. Creates users, models, audits, compliance,
drift history, and alerts.

Usage:
    python seed_demo.py
    python seed_demo.py --reset   # drops and recreates all tables
"""
import asyncio
import argparse
import sys
import os
import random
from datetime import datetime, timedelta

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) + '/backend')

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext
from db.database import (
    Base, User, AIModel, AuditResult, ComplianceResult, DriftRecord, Alert,
    UserTier, ModelStatus
)
import uuid

DATABASE_URL = "sqlite+aiosqlite:///./backend/ai_sheriff.db"
engine = create_async_engine(DATABASE_URL)
AsyncSessionLocal = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

DEMO_MODELS = [
    {
        "name": "GPT-4 Turbo Production",
        "description": "OpenAI GPT-4 Turbo used for customer support automation",
        "model_type": "llm",
        "trust_score": 84.2,
        "risk_level": "Low",
        "audit": {"bias": 91.0, "hallucination": 87.0, "toxicity": 94.0, "jailbreak": 75.0},
        "compliance": {"eu": 81.0, "nist": 86.0, "dpdp": 79.0},
        "drift_trend": "stable",
    },
    {
        "name": "HR Screening Agent v3",
        "description": "Automated agent for initial HR resume screening and candidate shortlisting",
        "model_type": "agent",
        "trust_score": 47.3,
        "risk_level": "High",
        "audit": {"bias": 41.0, "hallucination": 55.0, "toxicity": 62.0, "jailbreak": 31.0},
        "compliance": {"eu": 38.0, "nist": 51.0, "dpdp": 42.0},
        "drift_trend": "degrading",
    },
    {
        "name": "LoanDecide v2.1",
        "description": "ML model for personal loan approval decisions at FinBank",
        "model_type": "ml_model",
        "trust_score": 63.8,
        "risk_level": "Medium",
        "audit": {"bias": 68.0, "hallucination": 71.0, "toxicity": 88.0, "jailbreak": 27.0},
        "compliance": {"eu": 68.0, "nist": 62.0, "dpdp": 60.0},
        "drift_trend": "slight_decline",
    },
    {
        "name": "MedDiagnose Assistant",
        "description": "Clinical decision support LLM for preliminary diagnosis suggestions",
        "model_type": "llm",
        "trust_score": 91.5,
        "risk_level": "Low",
        "audit": {"bias": 93.0, "hallucination": 91.0, "toxicity": 97.0, "jailbreak": 85.0},
        "compliance": {"eu": 94.0, "nist": 92.0, "dpdp": 88.0},
        "drift_trend": "stable",
    },
]

TREND_GENERATORS = {
    "stable":        lambda base, i: base + random.gauss(0, 1.5),
    "degrading":     lambda base, i: base - (i * 0.4) + random.gauss(0, 2),
    "slight_decline":lambda base, i: base - (i * 0.1) + random.gauss(0, 1.8),
}


async def seed():
    print("🛡️  AI Sheriff — Seeding demo data...")

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as db:
        # Create demo user
        demo_user = User(
            id=str(uuid.uuid4()),
            email="demo@aisheriff.com",
            hashed_password=pwd_context.hash("Sheriff2024!"),
            full_name="Lakshay Sharma",
            company_name="IIIT Delhi",
            tier=UserTier.ENTERPRISE,
            auth_key="SHERIFF-DEMO-ENTERPRISE-2024",
            models_registered=len(DEMO_MODELS),
        )
        # Check if exists
        from sqlalchemy import select
        existing = await db.execute(select(User).where(User.email == "demo@aisheriff.com"))
        if not existing.scalar_one_or_none():
            db.add(demo_user)
            await db.flush()
            user_id = demo_user.id
            print(f"  ✓ Created demo user: demo@aisheriff.com / Sheriff2024!")
        else:
            user_id = existing.scalar_one_or_none().id if existing else demo_user.id
            print(f"  ℹ Demo user already exists, skipping user creation")

        # Also create free trial user for testing limits
        free_existing = await db.execute(select(User).where(User.email == "free@test.com"))
        if not free_existing.scalar_one_or_none():
            free_user = User(
                email="free@test.com",
                hashed_password=pwd_context.hash("test1234"),
                full_name="Test User",
                tier=UserTier.FREE,
                auth_key="SHERIFF-FREE-TEST-0001",
                models_registered=0,
            )
            db.add(free_user)
            print(f"  ✓ Created free trial user: free@test.com / test1234")

        for mdata in DEMO_MODELS:
            model = AIModel(
                id=str(uuid.uuid4()),
                user_id=user_id,
                name=mdata["name"],
                description=mdata["description"],
                model_type=mdata["model_type"],
                status=ModelStatus.ACTIVE,
                trust_score=mdata["trust_score"],
                risk_level=mdata["risk_level"],
                last_audited=datetime.utcnow() - timedelta(hours=random.randint(1, 24)),
            )
            db.add(model)
            await db.flush()

            # Audit result
            a = mdata["audit"]
            adv = (a["bias"] + a["toxicity"] + a["jailbreak"]) / 3
            total = 18
            passed = int(total * (adv / 100))
            audit = AuditResult(
                model_id=model.id,
                test_type="full_adversarial",
                total_tests=total,
                passed=passed,
                failed=total - passed,
                bias_score=a["bias"],
                hallucination_score=a["hallucination"],
                toxicity_score=a["toxicity"],
                jailbreak_resistance=a["jailbreak"],
                adversarial_score=adv,
                detailed_results={
                    "bias": {"passed": int(4 * a["bias"]/100), "failed": 4 - int(4 * a["bias"]/100), "cases": []},
                    "hallucination": {"passed": int(4 * a["hallucination"]/100), "failed": 4 - int(4 * a["hallucination"]/100), "cases": []},
                    "toxicity": {"passed": int(3 * a["toxicity"]/100), "failed": 3 - int(3 * a["toxicity"]/100), "cases": []},
                    "jailbreak": {"passed": int(4 * a["jailbreak"]/100), "failed": 4 - int(4 * a["jailbreak"]/100), "cases": []},
                    "explainability": {"passed": 3, "failed": 0, "cases": []},
                },
            )
            db.add(audit)

            # Compliance result
            c = mdata["compliance"]
            comp = ComplianceResult(
                model_id=model.id,
                eu_ai_act_score=c["eu"],
                nist_rmf_score=c["nist"],
                india_dpdp_score=c["dpdp"],
                overall_compliance=(c["eu"] + c["nist"] + c["dpdp"]) / 3,
                gaps=["Missing human oversight documentation"] if c["eu"] < 80 else [],
                framework_details={"recommendations": ["Implement audit logging", "Add human review checkpoints"]},
            )
            db.add(comp)

            # 30 days of drift data
            base = mdata["trust_score"]
            trend_fn = TREND_GENERATORS[mdata["drift_trend"]]
            now = datetime.utcnow()
            for i in range(30):
                ts = now - timedelta(days=29 - i)
                score = max(5, min(100, trend_fn(base, i)))
                drift = abs(score - base) > 8
                db.add(DriftRecord(
                    model_id=model.id,
                    timestamp=ts,
                    trust_score=round(score, 1),
                    accuracy_delta=round(random.gauss(0, 1.2), 2),
                    behavior_drift=round(abs(score - base) / 100, 3),
                    performance_delta=round(random.gauss(0, 0.8), 2),
                    drift_detected=drift,
                    drift_severity="high" if drift and score < 40 else ("medium" if drift else "none"),
                ))

            # Alerts for risky models
            if mdata["risk_level"] in ("High", "Critical"):
                db.add(Alert(
                    model_id=model.id,
                    user_id=user_id,
                    alert_type="audit_failure",
                    severity="high",
                    title=f"⚠️ High Risk: {mdata['name']}",
                    message=f"Model scored {mdata['trust_score']:.1f}/100 in adversarial testing. Immediate review required before production use.",
                    is_read=False,
                ))

            print(f"  ✓ Seeded: {mdata['name']} (trust: {mdata['trust_score']}, risk: {mdata['risk_level']})")

        await db.commit()

    print(f"\n✅ Demo data seeded successfully!")
    print(f"\n   Login credentials:")
    print(f"   Enterprise: demo@aisheriff.com  /  Sheriff2024!")
    print(f"   Free Trial: free@test.com       /  test1234")
    print(f"\n   Dashboard: http://localhost:3000/auth")
    print(f"   API Docs:  http://localhost:8000/docs\n")


async def reset():
    print("⚠️  Resetting database...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    print("✓ Tables dropped")
    await seed()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="AI Sheriff demo data seeder")
    parser.add_argument("--reset", action="store_true", help="Drop and recreate all tables")
    args = parser.parse_args()
    asyncio.run(reset() if args.reset else seed())