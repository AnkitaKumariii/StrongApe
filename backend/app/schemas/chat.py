from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from app.schemas.user import UserPublic

class ChatMessageCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=2000)

class ChatMessageOut(BaseModel):
    id: int
    thread_id: int
    sender_id: int
    content: str
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ChatThreadOut(BaseModel):
    id: int
    created_at: datetime
    participants: List[UserPublic]
    last_message: Optional[ChatMessageOut] = None
    unread_count: int = 0

    class Config:
        from_attributes = True
