from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from typing import Dict, List
import asyncio
from datetime import datetime
from jose import JWTError, jwt
import os

router = APIRouter()
SECRET_KEY = os.getenv("SECRET_KEY", "ai-sheriff-super-secret-key-change-in-prod")
ALGORITHM = "HS256"
_connections: Dict[str, List[WebSocket]] = {}

def _verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("sub")
    except JWTError:
        return None

async def broadcast_to_user(user_id: str, event: dict):
    sockets = _connections.get(user_id, [])
    dead = []
    for ws in sockets:
        try:
            await ws.send_json(event)
        except Exception:
            dead.append(ws)
    for ws in dead:
        sockets.remove(ws)

async def broadcast_alert(user_id: str, alert_type: str, severity: str, title: str, message: str):
    await broadcast_to_user(user_id, {"type": "alert", "alert_type": alert_type, "severity": severity,
                                       "title": title, "message": message, "timestamp": datetime.utcnow().isoformat()})

@router.websocket("/alerts")
async def ws_alerts(websocket: WebSocket, token: str = Query(...)):
    user_id = _verify_token(token)
    if not user_id:
        await websocket.close(code=4001, reason="Invalid token")
        return
    await websocket.accept()
    _connections.setdefault(user_id, []).append(websocket)
    await websocket.send_json({"type": "connected", "message": "AI Sheriff live monitoring active", "timestamp": datetime.utcnow().isoformat()})
    try:
        while True:
            await asyncio.sleep(30)
            await websocket.send_json({"type": "ping", "timestamp": datetime.utcnow().isoformat()})
    except WebSocketDisconnect:
        conns = _connections.get(user_id, [])
        if websocket in conns:
            conns.remove(websocket)