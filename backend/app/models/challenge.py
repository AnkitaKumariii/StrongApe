from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, unique=True, index=True, nullable=False)
    description = Column(Text, nullable=False)
    total_days = Column(Integer, default=30, nullable=False)
    xp_reward = Column(Integer, default=100, nullable=False)
    is_global = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    participants = relationship("UserChallenge", back_populates="challenge", cascade="all, delete-orphan")

class UserChallenge(Base):
    __tablename__ = "user_challenges"

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    challenge_id = Column(Integer, ForeignKey("challenges.id", ondelete="CASCADE"), primary_key=True)
    progress_days = Column(Integer, default=0, nullable=False)
    is_completed = Column(Boolean, default=False, nullable=False)
    joined_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    # Relationships
    challenge = relationship("Challenge", back_populates="participants")
    user = relationship("User")
