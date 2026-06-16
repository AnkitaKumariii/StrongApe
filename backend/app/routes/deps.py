from fastapi import Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.security import decode_token
from app.core.errors import UnauthorizedException
from app.models.user import User

security_scheme = HTTPBearer()

async def get_current_user(
    token: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db)
) -> User:
    user_id_str = decode_token(token.credentials)
    if not user_id_str:
        raise UnauthorizedException("Invalid or expired authentication token")
    
    try:
        user_id = int(user_id_str)
    except ValueError:
        raise UnauthorizedException("Invalid token payload format")
        
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalars().first()
    if not user:
        raise UnauthorizedException("Authenticated user not found")
    if not user.is_active:
        raise UnauthorizedException("User account is disabled")
        
    return user
