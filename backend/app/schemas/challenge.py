from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class ChallengeCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=150)
    description: str = Field(..., min_length=10, max_length=1000)
    total_days: int = Field(30, gt=0, lt=366)
    xp_reward: int = Field(100, ge=0)
    is_global: bool = False

class ChallengeOut(BaseModel):
    id: int
    title: str
    description: str
    total_days: int
    xp_reward: int
    is_global: bool
    created_at: datetime
    participant_count: int

    class Config:
        from_attributes = True

class UserChallengeOut(BaseModel):
    user_id: int
    challenge_id: int
    progress_days: int
    is_completed: bool
    joined_at: datetime
    challenge: ChallengeOut

    class Config:
        from_attributes = True
