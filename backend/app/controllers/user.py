from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user import UserService
from app.schemas.user import UserCreate, UserLogin, UserProfileUpdate, Token, UserOut
from app.core.security import verify_password, create_access_token
from app.core.errors import UnauthorizedException, BadRequestException
from app.models.user import User
from typing import List, Dict, Any

class UserController:
    @staticmethod
    async def register(db: AsyncSession, user_in: UserCreate) -> User:
        return await UserService.create_user(db=db, obj_in=user_in)

    @staticmethod
    async def login(db: AsyncSession, credentials: UserLogin) -> Token:
        user = await UserService.get_by_email_or_username(db=db, identifier=credentials.username_or_email)
        if not user or not verify_password(credentials.password, user.hashed_password):
            raise UnauthorizedException("Incorrect username/email or password")
            
        access_token = create_access_token(subject=user.id)
        return Token(access_token=access_token, token_type="bearer")

    @staticmethod
    async def get_profile(user: User) -> User:
        return user

    @staticmethod
    async def update_profile(db: AsyncSession, user: User, profile_in: UserProfileUpdate) -> User:
        return await UserService.update_user(db=db, db_user=user, obj_in=profile_in)

    @staticmethod
    async def get_nearby_users(db: AsyncSession, user: User, max_distance: float = 50.0) -> List[Dict[str, Any]]:
        nearby = await UserService.list_nearby_users(db=db, current_user=user, max_distance_km=max_distance)
        results = []
        for item in nearby:
            u = item["user"]
            results.append({
                "id": u.id,
                "username": u.username,
                "full_name": u.full_name,
                "avatar_url": u.avatar_url,
                "level": u.level,
                "current_streak": u.current_streak,
                "gym_name": u.gym_name,
                "distance_km": item["distance_km"]
            })
        return results
