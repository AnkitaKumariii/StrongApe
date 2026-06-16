from sqlalchemy.ext.asyncio import AsyncSession
from app.services.challenge import ChallengeService
from app.schemas.challenge import ChallengeCreate, ChallengeOut, UserChallengeOut
from app.models.user import User
from typing import List

class ChallengeController:
    @staticmethod
    async def create_challenge(db: AsyncSession, challenge_in: ChallengeCreate) -> ChallengeOut:
        db_ch = await ChallengeService.create_challenge(db=db, obj_in=challenge_in)
        return ChallengeOut(
            id=db_ch.id,
            title=db_ch.title,
            description=db_ch.description,
            total_days=db_ch.total_days,
            xp_reward=db_ch.xp_reward,
            is_global=db_ch.is_global,
            created_at=db_ch.created_at,
            participant_count=0
        )

    @staticmethod
    async def list_active(db: AsyncSession, user: User) -> List[UserChallengeOut]:
        active_list = await ChallengeService.list_active_challenges(db=db, user_id=user.id)
        
        results = []
        for uc in active_list:
            ch = uc.challenge
            # Count participants
            ch_out = ChallengeOut(
                id=ch.id,
                title=ch.title,
                description=ch.description,
                total_days=ch.total_days,
                xp_reward=ch.xp_reward,
                is_global=ch.is_global,
                created_at=ch.created_at,
                participant_count=0 # Simplified, or can load count
            )
            results.append(UserChallengeOut(
                user_id=uc.user_id,
                challenge_id=uc.challenge_id,
                progress_days=uc.progress_days,
                is_completed=uc.is_completed,
                joined_at=uc.joined_at,
                challenge=ch_out
            ))
        return results

    @staticmethod
    async def list_browsable(db: AsyncSession, user: User) -> List[ChallengeOut]:
        data = await ChallengeService.list_browsable_challenges(db=db, user_id=user.id)
        return [ChallengeOut(**d) for d in data]

    @staticmethod
    async def join_challenge(db: AsyncSession, user: User, challenge_id: int) -> UserChallengeOut:
        uc = await ChallengeService.join_challenge(db=db, challenge_id=challenge_id, user_id=user.id)
        ch = uc.challenge
        ch_out = ChallengeOut(
            id=ch.id,
            title=ch.title,
            description=ch.description,
            total_days=ch.total_days,
            xp_reward=ch.xp_reward,
            is_global=ch.is_global,
            created_at=ch.created_at,
            participant_count=1
        )
        return UserChallengeOut(
            user_id=uc.user_id,
            challenge_id=uc.challenge_id,
            progress_days=uc.progress_days,
            is_completed=uc.is_completed,
            joined_at=uc.joined_at,
            challenge=ch_out
        )

    @staticmethod
    async def advance_progress(db: AsyncSession, user: User, challenge_id: int, days: int = 1) -> UserChallengeOut:
        uc = await ChallengeService.update_challenge_progress(db=db, challenge_id=challenge_id, user=user, days_to_add=days)
        ch = uc.challenge
        ch_out = ChallengeOut(
            id=ch.id,
            title=ch.title,
            description=ch.description,
            total_days=ch.total_days,
            xp_reward=ch.xp_reward,
            is_global=ch.is_global,
            created_at=ch.created_at,
            participant_count=1
        )
        return UserChallengeOut(
            user_id=uc.user_id,
            challenge_id=uc.challenge_id,
            progress_days=uc.progress_days,
            is_completed=uc.is_completed,
            joined_at=uc.joined_at,
            challenge=ch_out
        )
