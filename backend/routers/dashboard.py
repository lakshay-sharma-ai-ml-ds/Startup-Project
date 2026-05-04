from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
import sys
sys.path.append('..')
from db.database import get_db, AIModel, AuditResult, ComplianceResult, Alert, DriftRecord, User
from routers.auth import get_current_user

router = APIRouter()

@router.get("/summary/{model_id}")
async def get_dashboard_summary(model_id: str, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    mr = await db.execute(select(AIModel).where(AIModel.id == model_id, AIModel.user_id == user.id))
    model = mr.scalar_one_or_none()
    if not model:
        return {"error": "Model not found"}
    ar = await db.execute(select(AuditResult).where(AuditResult.model_id == model_id).order_by(AuditResult.created_at.desc()).limit(1))
    audit = ar.scalar_one_or_none()
    cr = await db.execute(select(ComplianceResult).where(ComplianceResult.model_id == model_id).order_by(ComplianceResult.created_at.desc()).limit(1))
    comp = cr.scalar_one_or_none()
    alr = await db.execute(select(func.count(Alert.id)).where(Alert.model_id == model_id, Alert.is_read == False))
    unread_alerts = alr.scalar()
    dr = await db.execute(select(DriftRecord).where(DriftRecord.model_id == model_id).order_by(DriftRecord.timestamp.desc()).limit(1))
    latest_drift = dr.scalar_one_or_none()
    return {
        "model": {"id": model.id, "name": model.name, "model_type": model.model_type, "status": model.status,
                  "trust_score": model.trust_score, "risk_level": model.risk_level,
                  "last_audited": model.last_audited.isoformat() if model.last_audited else None},
        "audit": {"total_tests": audit.total_tests if audit else 0, "passed": audit.passed if audit else 0,
                  "failed": audit.failed if audit else 0,
                  "pass_rate": round(audit.passed / audit.total_tests * 100, 1) if audit and audit.total_tests > 0 else 0,
                  "bias_score": audit.bias_score if audit else None,
                  "hallucination_score": audit.hallucination_score if audit else None,
                  "toxicity_score": audit.toxicity_score if audit else None,
                  "jailbreak_resistance": audit.jailbreak_resistance if audit else None,
                  "last_run": audit.created_at.isoformat() if audit else None},
        "compliance": {"overall": comp.overall_compliance if comp else None,
                       "eu_ai_act": comp.eu_ai_act_score if comp else None,
                       "nist_rmf": comp.nist_rmf_score if comp else None,
                       "india_dpdp": comp.india_dpdp_score if comp else None,
                       "gaps_count": len(comp.gaps) if comp and comp.gaps else 0},
        "drift": {"latest_score": latest_drift.trust_score if latest_drift else model.trust_score,
                  "drift_detected": latest_drift.drift_detected if latest_drift else False,
                  "severity": latest_drift.drift_severity if latest_drift else "none"},
        "alerts": {"unread": unread_alerts},
    }