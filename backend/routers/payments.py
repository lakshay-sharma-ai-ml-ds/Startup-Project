from fastapi import APIRouter, HTTPException, Depends, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from pydantic import BaseModel
import os, sys
sys.path.append('..')
from db.database import get_db, User, UserTier
from routers.auth import get_current_user

router = APIRouter()
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

class CheckoutRequest(BaseModel):
    tier: str
    billing: str

@router.post("/create-checkout")
async def create_checkout(req: CheckoutRequest, user: User = Depends(get_current_user)):
    if not STRIPE_SECRET_KEY:
        return {"session_url": f"https://checkout.stripe.com/demo?tier={req.tier}", "mode": "demo",
                "message": "Set STRIPE_SECRET_KEY in .env to enable real payments."}
    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        session = stripe.checkout.Session.create(
            customer_email=user.email, mode="subscription",
            line_items=[{"price": f"price_{req.tier}_{req.billing}", "quantity": 1}],
            success_url="http://localhost:3000/dashboard/settings?upgraded=true",
            cancel_url="http://localhost:3000/dashboard/settings?cancelled=true",
            metadata={"user_id": user.id, "tier": req.tier})
        return {"session_url": session.url}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None), db: AsyncSession = Depends(get_db)):
    if not STRIPE_SECRET_KEY:
        return {"status": "demo_mode"}
    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        body = await request.body()
        event = stripe.Webhook.construct_event(body, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        user_id = session["metadata"].get("user_id")
        new_tier = session["metadata"].get("tier")
        if user_id and new_tier in ("personal", "enterprise"):
            await db.execute(update(User).where(User.id == user_id).values(tier=UserTier(new_tier)))
            await db.commit()
    return {"status": "ok"}

@router.get("/prices")
async def get_prices():
    return {"personal": {"monthly": 2499, "annual": 24990}, "enterprise": {"monthly": 24999, "annual": 249990}, "stripe_active": bool(STRIPE_SECRET_KEY)}