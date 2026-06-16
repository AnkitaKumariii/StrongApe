from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.checkin import CheckInController
from app.schemas.checkin import CheckInCreate, CheckInOut
from app.models.user import User

router = APIRouter()

@router.post("", response_model=CheckInOut, status_code=status.HTTP_201_CREATED)
async def log_workout(
    checkin_in: CheckInCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await CheckInController.create_checkin(db=db, user=current_user, checkin_in=checkin_in)
