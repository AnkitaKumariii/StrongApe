import logging

from fastapi import APIRouter, Depends, HTTPException

from app.core.errors import BadRequestException
from app.models.user import User
from app.routes.deps import get_current_user
from app.schemas.workout_routines import WorkoutRoutinesResponse
from app.services.workout_routines import WorkoutRoutinesService

logger = logging.getLogger(__name__)

router = APIRouter()

_service: WorkoutRoutinesService | None = None


def get_workout_service() -> WorkoutRoutinesService:
    global _service
    if _service is None:
        _service = WorkoutRoutinesService()
    return _service


@router.post("/generate", response_model=WorkoutRoutinesResponse)
async def generate_workout_routines(
    current_user: User = Depends(get_current_user),
):
    fitness_profile = (current_user.settings or {}).get("fitness_profile")
    if not fitness_profile:
        raise BadRequestException(
            "Please complete your fitness profile on the dashboard before generating a workout plan."
        )

    required_fields = ["primaryGoal", "weight", "height", "eatingStyle", "caffeine", "sugar"]
    missing = [field for field in required_fields if not fitness_profile.get(field)]
    if missing:
        raise BadRequestException(
            "Your fitness profile is incomplete. Please update it on the dashboard."
        )

    try:
        service = get_workout_service()
        return await service.generate_workout_plan(fitness_profile)
    except HTTPException as exc:
        return WorkoutRoutinesResponse(success=False, error=str(exc.detail))
    except Exception as exc:
        logger.error("Error in workout routines endpoint: %s", exc)
        return WorkoutRoutinesResponse(success=False, error=str(exc))
