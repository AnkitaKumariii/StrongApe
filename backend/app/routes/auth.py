from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.core.config import settings
from app.controllers.user import UserController
from app.schemas.user import UserCreate, UserLogin, UserOut, Token, GoogleAuthInput

router = APIRouter()

@router.get("/config")
async def get_config():
    return {"google_client_id": settings.GOOGLE_CLIENT_ID}

@router.post("/register", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def register(user_in: UserCreate, db: AsyncSession = Depends(get_db)):
    return await UserController.register(db=db, user_in=user_in)

@router.post("/login", response_model=Token)
async def login(credentials: UserLogin, db: AsyncSession = Depends(get_db)):
    return await UserController.login(db=db, credentials=credentials)

@router.post("/google", response_model=Token)
async def google_login(payload: GoogleAuthInput, db: AsyncSession = Depends(get_db)):
    return await UserController.google_auth(db=db, credential=payload.credential)
