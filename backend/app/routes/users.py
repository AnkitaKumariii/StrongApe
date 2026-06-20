from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.user import UserController
from app.schemas.user import UserOut, UserProfileUpdate
from app.models.user import User
from app.services import presence as presence_store
from typing import List, Dict, Any

router = APIRouter()

@router.get("/me", response_model=UserOut)
async def get_me(current_user: User = Depends(get_current_user)):
    return await UserController.get_profile(current_user)

@router.patch("/me/profile", response_model=UserOut)
async def update_profile(
    profile_in: UserProfileUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await UserController.update_profile(db=db, user=current_user, profile_in=profile_in)

@router.get("/nearby", response_model=List[Dict[str, Any]])
async def get_nearby(
    max_distance_km: float = Query(50.0, gt=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await UserController.get_nearby_users(db=db, user=current_user, max_distance=max_distance_km)

@router.get("/leaderboard", response_model=List[UserOut])
async def get_leaderboard(
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from sqlalchemy.future import select
    result = await db.execute(select(User).order_by(User.xp.desc()).limit(limit))
    return result.scalars().all()


@router.get("/{user_id}/presence")
async def get_user_presence(
    user_id: int,
    current_user: User = Depends(get_current_user),
):
    """Returns whether a user currently has an active WebSocket connection."""
    return {"user_id": user_id, "online": presence_store.is_online(user_id)}

