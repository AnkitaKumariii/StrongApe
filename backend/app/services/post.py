from typing import List, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.models.post import Post, PostLike
from app.models.user import User
from app.schemas.post import PostCreate
from app.core.errors import NotFoundException, ForbiddenException

class PostService:
    @staticmethod
    async def create_post(db: AsyncSession, user_id: int, obj_in: PostCreate) -> Post:
        db_post = Post(
            user_id=user_id,
            content=obj_in.content,
            post_type=obj_in.post_type,
            post_metadata=obj_in.post_metadata,
            media_url=obj_in.media_url
        )
        db.add(db_post)
        await db.commit()
        await db.refresh(db_post)
        
        # Load author relationship
        result = await db.execute(
            select(Post)
            .where(Post.id == db_post.id)
            .options(selectinload(Post.author))
        )
        return result.scalars().first()

    @staticmethod
    async def list_posts(db: AsyncSession, current_user_id: int, limit: int = 20, skip: int = 0) -> List[dict]:
        # Query posts sorted by date
        result = await db.execute(
            select(Post)
            .options(selectinload(Post.author), selectinload(Post.likes))
            .order_by(Post.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        posts = result.scalars().all()
        
        feed_posts = []
        for post in posts:
            likes_count = len(post.likes)
            has_liked = any(like.user_id == current_user_id for like in post.likes)
            
            feed_posts.append({
                "id": post.id,
                "user_id": post.user_id,
                "content": post.content,
                "post_type": post.post_type,
                "post_metadata": post.post_metadata,
                "media_url": post.media_url,
                "created_at": post.created_at,
                "author": post.author,
                "likes_count": likes_count,
                "has_liked": has_liked
            })
            
        return feed_posts

    @staticmethod
    async def toggle_like(db: AsyncSession, post_id: int, user_id: int) -> Tuple[bool, int]:
        # Check if post exists
        post_check = await db.execute(select(Post).where(Post.id == post_id))
        if not post_check.scalars().first():
            raise NotFoundException("Post not found")
            
        # Check if user already liked
        like_check = await db.execute(
            select(PostLike).where((PostLike.post_id == post_id) & (PostLike.user_id == user_id))
        )
        existing_like = like_check.scalars().first()
        
        if existing_like:
            # Unlike
            await db.delete(existing_like)
            liked = False
        else:
            # Like
            new_like = PostLike(post_id=post_id, user_id=user_id)
            db.add(new_like)
            liked = True
            
        await db.commit()
        
        # Recalculate likes count
        count_res = await db.execute(
            select(func.count()).select_from(PostLike).where(PostLike.post_id == post_id)
        )
        likes_count = count_res.scalar_one()
        
        return liked, likes_count

    @staticmethod
    async def delete_post(db: AsyncSession, user_id: int, post_id: int) -> bool:
        result = await db.execute(select(Post).where(Post.id == post_id))
        post = result.scalars().first()
        if not post:
            raise NotFoundException("Post not found")
        if post.user_id != user_id:
            raise ForbiddenException("You do not have permission to delete this post")
        
        await db.delete(post)
        await db.commit()
        return True
