from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime

class CheckInCreate(BaseModel):
    duration_minutes: int = Field(..., gt=0, lt=1440)
    intensity: str = Field(..., pattern="^(Low|Medium|High)$")
    notes: Optional[str] = Field(None, max_length=140)

class CheckInOut(BaseModel):
    id: int
    user_id: int
    logged_at: date
    duration_minutes: int
    intensity: str
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
