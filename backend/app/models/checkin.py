from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey
from sqlalchemy.sql import func
from app.core.database import Base

class CheckIn(Base):
    __tablename__ = "checkins"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    logged_at = Column(Date, nullable=False, server_default=func.current_date())
    duration_minutes = Column(Integer, nullable=False)
    intensity = Column(String, nullable=False)  # 'Low', 'Medium', 'High'
    notes = Column(String(140), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
