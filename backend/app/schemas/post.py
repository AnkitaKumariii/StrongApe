from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from app.schemas.user import UserPublic

class PostCreate(BaseModel):
    content: str = Field(..., min_length=1, max_length=1000)
    post_type: str = Field("regular", pattern="^(regular|check_in|badge_unlocked)$")
    post_metadata: Optional[Dict[str, Any]] = None
    media_url: Optional[str] = None

class PostOut(BaseModel):
    id: int
    user_id: int
    content: str
    post_type: str
    post_metadata: Optional[Dict[str, Any]] = None
    media_url: Optional[str] = None
    created_at: datetime
    author: UserPublic
    likes_count: int
    has_liked: bool

    class Config:
        from_attributes = True

class LikeToggle(BaseModel):
    liked: bool
    likes_count: int
