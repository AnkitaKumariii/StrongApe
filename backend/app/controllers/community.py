from sqlalchemy.ext.asyncio import AsyncSession
from app.services.community import CommunityService
from app.schemas.community import CommunityCreate, CommunityUpdate, CommunityOut, CommunityMemberOut
from app.models.user import User
from typing import List, Optional

class CommunityController:
    @staticmethod
    async def create_community(db: AsyncSession, comm_in: CommunityCreate, creator_id: int) -> CommunityOut:
        db_comm = await CommunityService.create_community(db=db, obj_in=comm_in, creator_id=creator_id)
        return CommunityOut(
            id=db_comm.id,
            name=db_comm.name,
            description=db_comm.description,
            cover_image_url=db_comm.cover_image_url,
            category=db_comm.category,
            created_at=db_comm.created_at,
            member_count=1,
            is_member=True,
            is_admin=True,
        )

    @staticmethod
    async def update_community(
        db: AsyncSession, community_id: int, comm_in: CommunityUpdate, current_user: User
    ) -> CommunityOut:
        data = await CommunityService.update_community(
            db=db, community_id=community_id, obj_in=comm_in, current_user_id=current_user.id
        )
        return CommunityOut(**data)

    @staticmethod
    async def list_communities(
        db: AsyncSession, user: User, category: Optional[str] = None
    ) -> List[CommunityOut]:
        data = await CommunityService.list_communities(db=db, current_user_id=user.id, category=category)
        return [CommunityOut(**d) for d in data]

    @staticmethod
    async def list_joined_communities(db: AsyncSession, user: User) -> List[CommunityOut]:
        data = await CommunityService.list_joined_communities(db=db, user_id=user.id)
        return [CommunityOut(**d) for d in data]

    @staticmethod
    async def join_community(db: AsyncSession, user: User, community_id: int) -> CommunityMemberOut:
        member = await CommunityService.join_community(db=db, community_id=community_id, user_id=user.id)
        return CommunityMemberOut.model_validate(member)

    @staticmethod
    async def get_community(db: AsyncSession, user: User, community_id: int) -> CommunityOut:
        data = await CommunityService.get_community(db=db, community_id=community_id, current_user_id=user.id)
        return CommunityOut(**data)

    @staticmethod
    async def delete_community(db: AsyncSession, user: User, community_id: int) -> None:
        await CommunityService.delete_community(db=db, community_id=community_id, current_user_id=user.id)
