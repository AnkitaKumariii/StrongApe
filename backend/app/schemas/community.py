from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class CommunityCreate(BaseModel):
    name: str = Field(..., min_length=3, max_length=100)
    description: str = Field(..., min_length=10, max_length=1000)
    cover_image_url: Optional[str] = None
    category: str = Field(..., min_length=2, max_length=50)

class CommunityUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=3, max_length=100)
    description: Optional[str] = Field(None, min_length=10, max_length=1000)
    category: Optional[str] = Field(None, min_length=2, max_length=50)

class CommunityOut(BaseModel):
    id: int
    name: str
    description: str
    cover_image_url: Optional[str] = None
    category: str
    created_at: datetime
    member_count: int
    is_member: bool
    is_admin: bool = False

    class Config:
        from_attributes = True

class CommunityMemberOut(BaseModel):
    community_id: int
    user_id: int
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True
