import math
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User
from app.schemas.user import UserCreate, UserProfileUpdate
from app.core.security import get_password_hash
from app.core.errors import BadRequestException

class UserService:
    @staticmethod
    async def create_user(db: AsyncSession, obj_in: UserCreate) -> User:
        # Check if email exists
        email_check = await db.execute(select(User).where(User.email == obj_in.email))
        if email_check.scalars().first():
            raise BadRequestException("A user with this email already exists")
            
        # Check if username exists
        username_check = await db.execute(select(User).where(User.username == obj_in.username))
        if username_check.scalars().first():
            raise BadRequestException("This username is already taken")
            
        hashed_password = get_password_hash(obj_in.password)
        db_user = User(
            email=obj_in.email,
            username=obj_in.username,
            full_name=obj_in.full_name,
            hashed_password=hashed_password,
            settings={"notifications": True, "privacy": False}
        )
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    @staticmethod
    async def get_by_email_or_username(db: AsyncSession, identifier: str) -> Optional[User]:
        result = await db.execute(
            select(User).where((User.email == identifier) | (User.username == identifier))
        )
        return result.scalars().first()

    @staticmethod
    async def update_user(db: AsyncSession, db_user: User, obj_in: UserProfileUpdate) -> User:
        update_data = obj_in.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            if field == "settings" and isinstance(value, dict):
                # Merge settings
                current_settings = db_user.settings or {}
                db_user.settings = {**current_settings, **value}
            else:
                setattr(db_user, field, value)
        db.add(db_user)
        await db.commit()
        await db.refresh(db_user)
        return db_user

    @staticmethod
    async def list_nearby_users(
        db: AsyncSession, current_user: User, max_distance_km: float = 50.0
    ) -> List[dict]:
        # Fetch all active users with valid lat/lon except current user
        result = await db.execute(
            select(User).where(
                (User.id != current_user.id) & 
                (User.location_lat.isnot(None)) & 
                (User.location_lon.isnot(None)) &
                (User.is_active == True)
            )
        )
        users = result.scalars().all()
        
        if not current_user.location_lat or not current_user.location_lon:
            # If current user doesn't have location, return empty list or all with null distance
            return []

        lat1, lon1 = current_user.location_lat, current_user.location_lon
        nearby_users = []
        
        for u in users:
            lat2, lon2 = u.location_lat, u.location_lon
            # Haversine formula
            dlat = math.radians(lat2 - lat1)
            dlon = math.radians(lon2 - lon1)
            a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * (math.sin(dlon / 2) ** 2)
            c = 2 * math.asin(math.sqrt(a))
            r = 6371  # Radius of earth in kilometers
            distance = c * r
            
            if distance <= max_distance_km:
                nearby_users.append({
                    "user": u,
                    "distance_km": round(distance, 2)
                })
                
        # Sort by distance
        nearby_users.sort(key=lambda x: x["distance_km"])
        return nearby_users
