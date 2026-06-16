from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.challenge import ChallengeController
from app.schemas.challenge import ChallengeCreate, ChallengeOut, UserChallengeOut
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("", response_model=ChallengeOut, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    challenge_in: ChallengeCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChallengeController.create_challenge(db=db, challenge_in=challenge_in)

@router.get("/active", response_model=List[UserChallengeOut])
async def list_active_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChallengeController.list_active(db=db, user=current_user)

@router.get("/browse", response_model=List[ChallengeOut])
async def list_browsable_challenges(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChallengeController.list_browsable(db=db, user=current_user)

@router.post("/{challenge_id}/join", response_model=UserChallengeOut)
async def join_challenge(
    challenge_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChallengeController.join_challenge(db=db, user=current_user, challenge_id=challenge_id)

@router.post("/{challenge_id}/progress", response_model=UserChallengeOut)
async def advance_progress(
    challenge_id: int,
    days: int = Query(1, ge=1, le=30),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChallengeController.advance_progress(db=db, user=current_user, challenge_id=challenge_id, days=days)
