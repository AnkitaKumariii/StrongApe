from sqlalchemy.ext.asyncio import AsyncSession
from app.services.checkin import CheckInService
from app.schemas.checkin import CheckInCreate, CheckInOut
from app.models.user import User

class CheckInController:
    @staticmethod
    async def create_checkin(db: AsyncSession, user: User, checkin_in: CheckInCreate) -> CheckInOut:
        db_checkin = await CheckInService.log_checkin(db=db, user=user, checkin_in=checkin_in)
        return CheckInOut.model_validate(db_checkin)
