from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from routers import auth, models, audit, compliance, drift, alerts, dashboard, chat, payments, public, websocket as ws_router
from db.database import init_db

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title="AI Sheriff API",
    description="The World's First Living Compliance Engine for AI — Audit. Comply. Trust.",
    version="1.0.0",
    lifespan=lifespan,
)

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000,http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,       prefix="/api/auth",       tags=["Authentication"])
app.include_router(models.router,     prefix="/api/models",     tags=["Model Registry"])
app.include_router(audit.router,      prefix="/api/audit",      tags=["Audit Engine"])
app.include_router(compliance.router, prefix="/api/compliance", tags=["Compliance Engine"])
app.include_router(drift.router,      prefix="/api/drift",      tags=["Drift Detection"])
app.include_router(alerts.router,     prefix="/api/alerts",     tags=["Alert System"])
app.include_router(dashboard.router,  prefix="/api/dashboard",  tags=["Dashboard"])
app.include_router(chat.router,       prefix="/api/chat",       tags=["Sheriff AI Assistant"])
app.include_router(payments.router,   prefix="/api/payments",   tags=["Payments"])
app.include_router(public.router,     prefix="/api/public",     tags=["Public Trust Registry"])
app.include_router(ws_router.router,  prefix="/ws",             tags=["WebSocket"])

@app.get("/")
async def root():
    return {"product": "AI Sheriff", "tagline": "Audit. Comply. Trust.", "version": "1.0.0", "docs": "/docs"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)