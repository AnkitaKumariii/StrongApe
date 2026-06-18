from sqlalchemy.ext.asyncio import AsyncSession
from app.services.post import PostService
from app.schemas.post import PostCreate, PostOut, LikeToggle
from app.models.user import User
from typing import List

class PostController:
    @staticmethod
    async def create_post(db: AsyncSession, user: User, post_in: PostCreate) -> PostOut:
        db_post = await PostService.create_post(db=db, user_id=user.id, obj_in=post_in)
        
        # Format mapping manually to match schema expectations
        return PostOut(
            id=db_post.id,
            user_id=db_post.user_id,
            content=db_post.content,
            post_type=db_post.post_type,
            post_metadata=db_post.post_metadata,
            media_url=db_post.media_url,
            created_at=db_post.created_at,
            author=db_post.author,
            likes_count=0,
            has_liked=False
        )

    @staticmethod
    async def get_feed(db: AsyncSession, user: User, limit: int = 20, skip: int = 0) -> List[PostOut]:
        posts_data = await PostService.list_posts(db=db, current_user_id=user.id, limit=limit, skip=skip)
        return [PostOut(**p) for p in posts_data]

    @staticmethod
    async def toggle_like(db: AsyncSession, user: User, post_id: int) -> LikeToggle:
        liked, likes_count = await PostService.toggle_like(db=db, post_id=post_id, user_id=user.id)
        return LikeToggle(liked=liked, likes_count=likes_count)

    @staticmethod
    async def delete_post(db: AsyncSession, user: User, post_id: int) -> bool:
        return await PostService.delete_post(db=db, user_id=user.id, post_id=post_id)
