from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.models.challenge import Challenge, UserChallenge
from app.models.user import User
from app.models.post import Post
from app.schemas.challenge import ChallengeCreate
from app.core.errors import NotFoundException, BadRequestException

class ChallengeService:
    @staticmethod
    async def create_challenge(db: AsyncSession, obj_in: ChallengeCreate) -> Challenge:
        existing = await db.execute(select(Challenge).where(Challenge.title == obj_in.title))
        if existing.scalars().first():
            raise BadRequestException("A challenge with this title already exists")
            
        db_ch = Challenge(
            title=obj_in.title,
            description=obj_in.description,
            total_days=obj_in.total_days,
            xp_reward=obj_in.xp_reward,
            is_global=obj_in.is_global
        )
        db.add(db_ch)
        await db.commit()
        await db.refresh(db_ch)
        return db_ch

    @staticmethod
    async def list_active_challenges(db: AsyncSession, user_id: int) -> List[UserChallenge]:
        result = await db.execute(
            select(UserChallenge)
            .join(Challenge, UserChallenge.challenge_id == Challenge.id)
            .where((UserChallenge.user_id == user_id) & (UserChallenge.is_completed == False))
            .options(selectinload(UserChallenge.challenge))
        )
        return list(result.scalars().all())

    @staticmethod
    async def list_browsable_challenges(db: AsyncSession, user_id: int) -> List[dict]:
        # Query challenges not joined by the user
        subquery = select(UserChallenge.challenge_id).where(UserChallenge.user_id == user_id)
        result = await db.execute(
            select(Challenge)
            .where(Challenge.id.notin_(subquery))
            .options(selectinload(Challenge.participants))
        )
        challenges = result.scalars().all()
        
        results = []
        for ch in challenges:
            results.append({
                "id": ch.id,
                "title": ch.title,
                "description": ch.description,
                "total_days": ch.total_days,
                "xp_reward": ch.xp_reward,
                "is_global": ch.is_global,
                "created_at": ch.created_at,
                "participant_count": len(ch.participants)
            })
        return results

    @staticmethod
    async def join_challenge(db: AsyncSession, challenge_id: int, user_id: int) -> UserChallenge:
        # Check if exists
        ch_check = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
        challenge = ch_check.scalars().first()
        if not challenge:
            raise NotFoundException("Challenge not found")
            
        # Check if already joined
        join_check = await db.execute(
            select(UserChallenge).where(
                (UserChallenge.challenge_id == challenge_id) & 
                (UserChallenge.user_id == user_id)
            )
        )
        if join_check.scalars().first():
            raise BadRequestException("You have already joined this challenge")
            
        new_join = UserChallenge(
            user_id=user_id,
            challenge_id=challenge_id,
            progress_days=0,
            is_completed=False
        )
        db.add(new_join)
        await db.commit()
        
        # Load relationship
        result = await db.execute(
            select(UserChallenge)
            .where((UserChallenge.challenge_id == challenge_id) & (UserChallenge.user_id == user_id))
            .options(selectinload(UserChallenge.challenge))
        )
        return result.scalars().first()

    @staticmethod
    async def update_challenge_progress(
        db: AsyncSession, challenge_id: int, user: User, days_to_add: int = 1
    ) -> UserChallenge:
        result = await db.execute(
            select(UserChallenge)
            .where((UserChallenge.challenge_id == challenge_id) & (UserChallenge.user_id == user.id))
            .options(selectinload(UserChallenge.challenge))
        )
        user_ch = result.scalars().first()
        if not user_ch:
            raise NotFoundException("Active challenge registration not found")
            
        if user_ch.is_completed:
            raise BadRequestException("This challenge is already completed")
            
        challenge = user_ch.challenge
        user_ch.progress_days += days_to_add
        
        # Check completion
        if user_ch.progress_days >= challenge.total_days:
            user_ch.progress_days = challenge.total_days
            user_ch.is_completed = True
            
            # Award XP
            user.xp += challenge.xp_reward
            new_level = (user.xp // 1000) + 1
            user.level = new_level
            db.add(user)
            
            # Auto-generate a milestone social feed post
            post_content = f"🏆 Completed the challenge: {challenge.title}! Earned a badge and +{challenge.xp_reward} XP!"
            post_metadata = {
                "challenge_id": challenge.id,
                "challenge_title": challenge.title,
                "xp_reward": challenge.xp_reward,
                "badge_unlocked": True
            }
            db_post = Post(
                user_id=user.id,
                content=post_content,
                post_type="badge_unlocked",
                post_metadata=post_metadata
            )
            db.add(db_post)
            
        db.add(user_ch)
        await db.commit()
        await db.refresh(user_ch)
        return user_ch
