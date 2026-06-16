from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.post import PostController
from app.schemas.post import PostCreate, PostOut, LikeToggle
from app.models.user import User
from typing import List

router = APIRouter()

@router.post("", response_model=PostOut)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await PostController.create_post(db=db, user=current_user, post_in=post_in)

@router.get("", response_model=List[PostOut])
async def get_feed(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await PostController.get_feed(db=db, user=current_user, limit=limit, skip=skip)

@router.post("/{post_id}/like", response_model=LikeToggle)
async def toggle_like(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await PostController.toggle_like(db=db, user=current_user, post_id=post_id)
