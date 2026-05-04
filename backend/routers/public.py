from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import sys
sys.path.append('..')
from db.database import get_db, AIModel, AuditResult, ComplianceResult, ModelStatus

router = APIRouter()

@router.get("/trust/{model_id}")
async def get_public_trust(model_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).where(AIModel.id == model_id))
    model = result.scalar_one_or_none()
    if not model:
        raise HTTPException(status_code=404, detail="Model not found in public registry")
    audit = (await db.execute(select(AuditResult).where(AuditResult.model_id == model_id).order_by(AuditResult.created_at.desc()).limit(1))).scalar_one_or_none()
    comp = (await db.execute(select(ComplianceResult).where(ComplianceResult.model_id == model_id).order_by(ComplianceResult.created_at.desc()).limit(1))).scalar_one_or_none()
    return {"model_id": model.id, "name": model.name, "model_type": model.model_type,
            "trust_score": model.trust_score, "risk_level": model.risk_level, "status": model.status,
            "last_audited": model.last_audited.isoformat() if model.last_audited else None,
            "sheriff_certified": model.trust_score >= 70 and model.status == ModelStatus.ACTIVE,
            "compliance": {"eu_ai_act": comp.eu_ai_act_score if comp else None, "nist_rmf": comp.nist_rmf_score if comp else None, "india_dpdp": comp.india_dpdp_score if comp else None},
            "audit_summary": {"total_tests": audit.total_tests if audit else 0, "pass_rate": round(audit.passed / audit.total_tests * 100, 1) if audit and audit.total_tests > 0 else None}}

@router.get("/registry")
async def get_public_registry(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).where(AIModel.status == ModelStatus.ACTIVE).order_by(AIModel.trust_score.desc()).limit(50))
    return {"models": [{"id": m.id, "name": m.name, "model_type": m.model_type, "trust_score": m.trust_score, "risk_level": m.risk_level, "sheriff_certified": m.trust_score >= 70} for m in result.scalars().all()]}

@router.get("/badge/{model_id}.svg")
async def get_trust_badge_svg(model_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AIModel).where(AIModel.id == model_id))
    model = result.scalar_one_or_none()
    score = model.trust_score if model else 0
    risk = model.risk_level if model else "N/A"
    name = (model.name[:18] + "…") if model and len(model.name) > 18 else (model.name if model else "Unknown")
    color = {"Low": "#3FB950", "Medium": "#F97316", "High": "#D29922", "Critical": "#F85149"}.get(risk, "#8B949E")
    svg = f"""<svg xmlns="http://www.w3.org/2000/svg" width="180" height="40"><rect width="180" height="40" rx="6" fill="#161B22"/><rect x="1" y="1" width="178" height="38" rx="5" fill="none" stroke="{color}" stroke-width="1" opacity="0.5"/><text x="10" y="14" font-family="monospace" font-size="8" fill="#8B949E">AI SHERIFF</text><text x="10" y="28" font-family="sans-serif" font-size="11" font-weight="600" fill="#E6EDF3">{name}</text><text x="145" y="22" font-family="monospace" font-size="13" font-weight="700" fill="{color}" text-anchor="middle">{score:.0f}</text><text x="145" y="32" font-family="monospace" font-size="7" fill="{color}" text-anchor="middle">{risk.upper()}</text></svg>"""
    return Response(content=svg, media_type="image/svg+xml", headers={"Cache-Control": "max-age=300", "Access-Control-Allow-Origin": "*"})