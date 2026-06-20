from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.community import CommunityController
from app.schemas.community import CommunityCreate, CommunityUpdate, CommunityOut, CommunityMemberOut
from app.models.user import User
from typing import List, Optional

router = APIRouter()

@router.post("", response_model=CommunityOut, status_code=status.HTTP_201_CREATED)
async def create_community(
    comm_in: CommunityCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityController.create_community(db=db, comm_in=comm_in, creator_id=current_user.id)

@router.get("", response_model=List[CommunityOut])
async def list_communities(
    category: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityController.list_communities(db=db, user=current_user, category=category)

@router.get("/joined", response_model=List[CommunityOut])
async def list_joined_communities(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityController.list_joined_communities(db=db, user=current_user)

@router.patch("/{community_id}", response_model=CommunityOut)
async def update_community(
    community_id: int,
    comm_in: CommunityUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityController.update_community(
        db=db, community_id=community_id, comm_in=comm_in, current_user=current_user
    )

@router.post("/{community_id}/join", response_model=CommunityMemberOut)
async def join_community(
    community_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityController.join_community(db=db, user=current_user, community_id=community_id)

@router.get("/{community_id}", response_model=CommunityOut)
async def get_community(
    community_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CommunityController.get_community(db=db, user=current_user, community_id=community_id)

@router.delete("/{community_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_community(
    community_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await CommunityController.delete_community(db=db, user=current_user, community_id=community_id)
