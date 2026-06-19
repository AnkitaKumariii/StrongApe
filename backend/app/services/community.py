from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.models.community import Community, CommunityMember
from app.schemas.community import CommunityCreate, CommunityUpdate
from app.core.errors import NotFoundException, BadRequestException, ForbiddenException

class CommunityService:
    @staticmethod
    async def create_community(db: AsyncSession, obj_in: CommunityCreate, creator_id: int) -> Community:
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
        await db.flush()  # get the id without committing

        # Auto-join creator as admin
        admin_member = CommunityMember(
            community_id=db_comm.id,
            user_id=creator_id,
            role="admin"
        )
        db.add(admin_member)
        await db.commit()
        await db.refresh(db_comm)
        return db_comm

    @staticmethod
    async def update_community(
        db: AsyncSession,
        community_id: int,
        obj_in: CommunityUpdate,
        current_user_id: int
    ) -> dict:
        result = await db.execute(
            select(Community)
            .where(Community.id == community_id)
            .options(selectinload(Community.members))
        )
        comm = result.scalars().first()
        if not comm:
            raise NotFoundException("Community not found")

        # Check if current user is admin of this community
        is_admin = any(
            m.user_id == current_user_id and m.role == "admin"
            for m in comm.members
        )
        # Backward compat: if no admin exists yet (legacy community), any member can edit
        has_any_admin = any(m.role == "admin" for m in comm.members)
        is_member = any(m.user_id == current_user_id for m in comm.members)
        if not is_admin and has_any_admin:
            raise ForbiddenException("Only community admins can edit this community")
        if not is_member and not is_admin:
            raise ForbiddenException("Only community members can edit this community")

        # Check name uniqueness if name is being changed
        if obj_in.name and obj_in.name != comm.name:
            existing = await db.execute(
                select(Community).where(Community.name == obj_in.name)
            )
            if existing.scalars().first():
                raise BadRequestException("A community with this name already exists")

        # Apply updates
        if obj_in.name is not None:
            comm.name = obj_in.name
        if obj_in.description is not None:
            comm.description = obj_in.description
        if obj_in.category is not None:
            comm.category = obj_in.category

        await db.commit()
        await db.refresh(comm)

        # Re-load members for fresh count
        result2 = await db.execute(
            select(Community)
            .where(Community.id == community_id)
            .options(selectinload(Community.members))
        )
        comm = result2.scalars().first()
        member_count = len(comm.members)

        return {
            "id": comm.id,
            "name": comm.name,
            "description": comm.description,
            "cover_image_url": comm.cover_image_url,
            "category": comm.category,
            "created_at": comm.created_at,
            "member_count": member_count,
            "is_member": True,
            "is_admin": True,
        }

    @staticmethod
    async def list_communities(
        db: AsyncSession, current_user_id: int, category: Optional[str] = None
    ) -> List[dict]:
        query = select(Community).options(selectinload(Community.members))
        if category:
            query = query.where(Community.category == category)
            
        result = await db.execute(query)
        communities = result.scalars().all()
        
        results = []
        for comm in communities:
            member_count = len(comm.members)
            is_member = any(m.user_id == current_user_id for m in comm.members)
            has_any_admin = any(m.role == "admin" for m in comm.members)
            is_admin = any(
                m.user_id == current_user_id and m.role == "admin"
                for m in comm.members
            )
            # Legacy fallback: if no admin exists, any member can edit
            effective_admin = is_admin or (is_member and not has_any_admin)
            results.append({
                "id": comm.id,
                "name": comm.name,
                "description": comm.description,
                "cover_image_url": comm.cover_image_url,
                "category": comm.category,
                "created_at": comm.created_at,
                "member_count": member_count,
                "is_member": is_member,
                "is_admin": effective_admin,
            })
            
        return results

    @staticmethod
    async def list_joined_communities(db: AsyncSession, user_id: int) -> List[dict]:
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
            is_admin = any(
                m.user_id == user_id and m.role == "admin"
                for m in comm.members
            )
            results.append({
                "id": comm.id,
                "name": comm.name,
                "description": comm.description,
                "cover_image_url": comm.cover_image_url,
                "category": comm.category,
                "created_at": comm.created_at,
                "member_count": member_count,
                "is_member": True,
                "is_admin": is_admin,
            })
            
        return results

    @staticmethod
    async def join_community(db: AsyncSession, community_id: int, user_id: int) -> CommunityMember:
        comm_check = await db.execute(select(Community).where(Community.id == community_id))
        if not comm_check.scalars().first():
            raise NotFoundException("Community not found")
            
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
        is_admin = any(
            m.user_id == current_user_id and m.role == "admin"
            for m in comm.members
        )
        
        return {
            "id": comm.id,
            "name": comm.name,
            "description": comm.description,
            "cover_image_url": comm.cover_image_url,
            "category": comm.category,
            "created_at": comm.created_at,
            "member_count": member_count,
            "is_member": is_member,
            "is_admin": is_admin,
        }
