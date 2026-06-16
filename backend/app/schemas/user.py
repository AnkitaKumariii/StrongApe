from pydantic import BaseModel, EmailStr, Field
from typing import Optional, Dict, Any
from datetime import datetime, date

class UserBase(BaseModel):
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=50)
    full_name: str = Field(..., min_length=1, max_length=100)

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, max_length=100)

class UserLogin(BaseModel):
    username_or_email: str
    password: str

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    gym_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    settings: Optional[Dict[str, Any]] = None
    avatar_url: Optional[str] = None

class UserOut(UserBase):
    id: int
    avatar_url: Optional[str] = None
    level: int
    xp: int
    current_streak: int
    last_checkin: Optional[date] = None
    gym_name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    settings: Dict[str, Any]
    created_at: datetime

    class Config:
        from_attributes = True

class UserPublic(BaseModel):
    id: int
    username: str
    full_name: str
    avatar_url: Optional[str] = None
    level: int
    current_streak: int
    gym_name: Optional[str] = None

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    user_id: Optional[int] = None
