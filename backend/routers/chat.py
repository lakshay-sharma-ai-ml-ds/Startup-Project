from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
import json, sys
sys.path.append('..')
from db.database import get_db, User, AIModel
from routers.auth import get_current_user
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

router = APIRouter()

SYSTEM_PROMPT = """You are Sheriff AI, an expert AI compliance and governance assistant inside AI Sheriff.
Answer questions about AI governance, compliance frameworks (EU AI Act, NIST RMF, India DPDP), audit results, bias, hallucination, drift, and remediation.
Be concise, expert, and direct. Max 200 words. Use bullet points for lists."""

class ChatRequest(BaseModel):
    message: str
    context: Optional[dict] = None

@router.post("/assistant")
async def chat_assistant(req: ChatRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    context_str = ""
    if req.context:
        context_str = f"\n\nUser's model context:\n{json.dumps(req.context, indent=2)}"
    else:
        try:
            models_res = await db.execute(select(AIModel).where(AIModel.user_id == user.id).limit(3))
            models = models_res.scalars().all()
            if models:
                context_str = f"\n\nUser's models: {json.dumps([{'name': m.name, 'trust_score': m.trust_score, 'risk_level': m.risk_level} for m in models])}"
        except Exception:
            pass
    try:
        import anthropic
        client = anthropic.Anthropic()
        message = client.messages.create(model="claude-sonnet-4-20250514", max_tokens=400,
                                         system=SYSTEM_PROMPT,
                                         messages=[{"role": "user", "content": req.message + context_str}])
        return {"reply": message.content[0].text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Assistant unavailable: {str(e)}")