"""
WebSocket endpoint for real-time chat.

Authentication: JWT token passed as ?token= query param because browsers
cannot set custom Authorization headers during a WebSocket handshake.
"""
from __future__ import annotations

import json
import logging
from collections import defaultdict
from typing import Dict, List

from fastapi import APIRouter, Query, WebSocket, WebSocketDisconnect, status
from sqlalchemy.future import select

from app.core.database import AsyncSessionLocal
from app.core.security import decode_token
from app.models.chat import ChatThreadParticipant
from app.schemas.chat import ChatMessageCreate, ChatMessageOut
from app.services.chat import ChatService

logger = logging.getLogger(__name__)

ws_router = APIRouter()


# ── Connection Manager ────────────────────────────────────────────────────────

class ConnectionManager:
    """Tracks active WebSocket connections grouped by chat thread_id."""

    def __init__(self) -> None:
        # thread_id -> list of (websocket, user_id)
        self._rooms: Dict[int, List[tuple]] = defaultdict(list)

    async def connect(self, websocket: WebSocket, thread_id: int, user_id: int) -> None:
        await websocket.accept()
        self._rooms[thread_id].append((websocket, user_id))
        logger.info("WS connect  user=%s thread=%s peers=%s", user_id, thread_id, len(self._rooms[thread_id]))

    def disconnect(self, websocket: WebSocket, thread_id: int, user_id: int) -> None:
        self._rooms[thread_id] = [
            (ws, uid) for ws, uid in self._rooms[thread_id] if ws is not websocket
        ]
        if not self._rooms[thread_id]:
            del self._rooms[thread_id]
        logger.info("WS disconnect user=%s thread=%s", user_id, thread_id)

    async def broadcast(self, thread_id: int, payload: dict) -> None:
        """Send a JSON payload to every connection in the thread room."""
        dead: list = []
        for ws, uid in list(self._rooms.get(thread_id, [])):
            try:
                await ws.send_json(payload)
            except Exception:
                dead.append((ws, uid))
        # Prune any connections that errored
        for ws, uid in dead:
            self._rooms[thread_id] = [
                (w, u) for w, u in self._rooms[thread_id] if w is not ws
            ]


manager = ConnectionManager()


# ── Helpers ───────────────────────────────────────────────────────────────────

async def _resolve_user_id(token: str) -> int | None:
    subject = decode_token(token)
    if not subject:
        return None
    try:
        return int(subject)
    except ValueError:
        return None


# ── WebSocket route ───────────────────────────────────────────────────────────

@ws_router.websocket("/ws/chats/{thread_id}")
async def websocket_chat(
    websocket: WebSocket,
    thread_id: int,
    token: str = Query(...),
):
    """
    Real-time WebSocket endpoint for a specific chat thread.

    Protocol (client → server):
      { "type": "message", "content": "<text>" }
      { "type": "ping" }

    Protocol (server → client):
      { "type": "message", "data": { ...ChatMessageOut } }
      { "type": "pong" }
      { "type": "error", "detail": "<reason>" }
    """
    # 1. Authenticate
    user_id = await _resolve_user_id(token)
    if user_id is None:
        await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
        return

    # 2. Authorise — user must be a participant of this thread
    async with AsyncSessionLocal() as db:
        part_res = await db.execute(
            select(ChatThreadParticipant).where(
                (ChatThreadParticipant.thread_id == thread_id)
                & (ChatThreadParticipant.user_id == user_id)
            )
        )
        if not part_res.scalars().first():
            await websocket.close(code=status.WS_1008_POLICY_VIOLATION)
            return

        # 3. Accept & register
        await manager.connect(websocket, thread_id, user_id)

        # 4. Message loop
        try:
            while True:
                raw = await websocket.receive_text()
                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    await websocket.send_json({"type": "error", "detail": "Invalid JSON"})
                    continue

                msg_type = data.get("type")

                if msg_type == "message":
                    content = (data.get("content") or "").strip()
                    if not content:
                        continue
                    db_msg = await ChatService.send_message(
                        db=db,
                        thread_id=thread_id,
                        sender_id=user_id,
                        obj_in=ChatMessageCreate(content=content),
                    )
                    out = ChatMessageOut.model_validate(db_msg)
                    await manager.broadcast(
                        thread_id,
                        {"type": "message", "data": out.model_dump(mode="json")},
                    )

                elif msg_type == "ping":
                    await websocket.send_json({"type": "pong"})

        except WebSocketDisconnect:
            pass
        finally:
            manager.disconnect(websocket, thread_id, user_id)
