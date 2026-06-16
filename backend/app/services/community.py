from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.models.community import Community, CommunityMember
from app.schemas.community import CommunityCreate
from app.core.errors import NotFoundException, BadRequestException

class CommunityService:
    @staticmethod
    async def create_community(db: AsyncSession, obj_in: CommunityCreate) -> Community:
        # Check if name exists
        existing = await db.execute(select(Community).where(Community.name == obj_in.name))
        if existing.scalars().first():
            raise BadRequestException("A community with this name already exists")
            
        db_comm = Community(
            name=obj_in.name,
            description=obj_in.description,
            cover_image_url=obj_in.cover_image_url,
            category=obj_in.category
        )
        db.add(db_comm)
        await db.commit()
        await db.refresh(db_comm)
        return db_comm

    @staticmethod
    async def list_communities(
        db: AsyncSession, current_user_id: int, category: Optional[str] = None
    ) -> List[dict]:
        # Build query
        query = select(Community).options(selectinload(Community.members))
        if category:
            query = query.where(Community.category == category)
            
        result = await db.execute(query)
        communities = result.scalars().all()
        
        results = []
        for comm in communities:
            member_count = len(comm.members)
            is_member = any(m.user_id == current_user_id for m in comm.members)
            
            results.append({
                "id": comm.id,
                "name": comm.name,
                "description": comm.description,
                "cover_image_url": comm.cover_image_url,
                "category": comm.category,
                "created_at": comm.created_at,
                "member_count": member_count,
                "is_member": is_member
            })
            
        return results

    @staticmethod
    async def list_joined_communities(db: AsyncSession, user_id: int) -> List[dict]:
        # Query community IDs the user is member of
        result = await db.execute(
            select(Community)
            .join(CommunityMember, Community.id == CommunityMember.community_id)
            .where(CommunityMember.user_id == user_id)
            .options(selectinload(Community.members))
        )
        communities = result.scalars().all()
        
        results = []
        for comm in communities:
            member_count = len(comm.members)
            results.append({
                "id": comm.id,
                "name": comm.name,
                "description": comm.description,
                "cover_image_url": comm.cover_image_url,
                "category": comm.category,
                "created_at": comm.created_at,
                "member_count": member_count,
                "is_member": True
            })
            
        return results

    @staticmethod
    async def join_community(db: AsyncSession, community_id: int, user_id: int) -> CommunityMember:
        # Check if community exists
        comm_check = await db.execute(select(Community).where(Community.id == community_id))
        if not comm_check.scalars().first():
            raise NotFoundException("Community not found")
            
        # Check if already a member
        member_check = await db.execute(
            select(CommunityMember).where(
                (CommunityMember.community_id == community_id) & 
                (CommunityMember.user_id == user_id)
            )
        )
        if member_check.scalars().first():
            raise BadRequestException("You are already a member of this community")
            
        new_member = CommunityMember(community_id=community_id, user_id=user_id, role="member")
        db.add(new_member)
        await db.commit()
        await db.refresh(new_member)
        return new_member

    @staticmethod
    async def get_community(db: AsyncSession, community_id: int, current_user_id: int) -> dict:
        result = await db.execute(
            select(Community)
            .where(Community.id == community_id)
            .options(selectinload(Community.members))
        )
        comm = result.scalars().first()
        if not comm:
            raise NotFoundException("Community not found")
            
        member_count = len(comm.members)
        is_member = any(m.user_id == current_user_id for m in comm.members)
        
        return {
            "id": comm.id,
            "name": comm.name,
            "description": comm.description,
            "cover_image_url": comm.cover_image_url,
            "category": comm.category,
            "created_at": comm.created_at,
            "member_count": member_count,
            "is_member": is_member
        }
