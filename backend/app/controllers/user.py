from sqlalchemy.ext.asyncio import AsyncSession
from app.services.user import UserService
from app.schemas.user import UserCreate, UserLogin, UserProfileUpdate, Token, UserOut
from app.core.security import verify_password, create_access_token
from app.core.errors import UnauthorizedException, BadRequestException
from app.core.config import settings
from app.models.user import User
from typing import List, Dict, Any
import httpx
import secrets
import re

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
    async def google_auth(db: AsyncSession, credential: str) -> Token:
        # Verify Google credential using Google TokenInfo API
        async with httpx.AsyncClient() as client:
            try:
                res = await client.get(
                    f"https://oauth2.googleapis.com/tokeninfo?id_token={credential}",
                    timeout=10.0
                )
            except Exception as exc:
                raise UnauthorizedException(f"Failed to reach Google verification service: {exc}")
                
            if res.status_code != 200:
                raise UnauthorizedException("Invalid Google ID token")
            user_info = res.json()

        # Check audience / client ID matches if configured
        if settings.GOOGLE_CLIENT_ID:
            if user_info.get("aud") != settings.GOOGLE_CLIENT_ID:
                raise UnauthorizedException("Google client ID mismatch")

        email = user_info.get("email")
        if not email:
            raise BadRequestException("Email not supplied by Google")

        # Lookup or create the user
        user = await UserService.get_by_email_or_username(db=db, identifier=email)
        if not user:
            # Generate a username based on the email prefix
            base_username = email.split("@")[0].lower()
            base_username = re.sub(r"[^a-z0-9_]", "", base_username)
            if len(base_username) < 3:
                base_username = "ape_" + base_username
            
            username = base_username
            # Handle username collision
            existing = await UserService.get_by_email_or_username(db=db, identifier=username)
            while existing:
                username = f"{base_username}{secrets.randbelow(1000)}"
                existing = await UserService.get_by_email_or_username(db=db, identifier=username)

            full_name = user_info.get("name") or user_info.get("given_name", "Ape Athlete")
            # Generate a random strong password for the DB hashed field
            random_password = secrets.token_urlsafe(32)
            
            user_in = UserCreate(
                email=email,
                username=username,
                full_name=full_name,
                password=random_password
            )
            
            user = await UserService.create_user(db=db, obj_in=user_in)

            # Update avatar URL if provided
            avatar_url = user_info.get("picture")
            if avatar_url:
                await UserService.update_user(
                    db=db,
                    db_user=user,
                    obj_in=UserProfileUpdate(avatar_url=avatar_url)
                )

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
