import logging

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from app.core.errors import BadRequestException
from app.models.user import User
from app.routes.deps import get_current_user
from app.schemas.food_scanner import FoodScanResponse
from app.services.food_scanner import FoodScannerService

logger = logging.getLogger(__name__)

router = APIRouter()

_food_scanner: FoodScannerService | None = None


def get_food_scanner() -> FoodScannerService:
    global _food_scanner
    if _food_scanner is None:
        _food_scanner = FoodScannerService()
    return _food_scanner


@router.post("", response_model=FoodScanResponse)
async def analyze_food(
    image: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
):
    del current_user  # auth required; user identity reserved for future logging/history

    if not image.content_type or not image.content_type.startswith("image/"):
        raise BadRequestException("File must be an image")

    allowed_types = {"image/jpeg", "image/png", "image/gif", "image/jpg", "image/webp"}
    if image.content_type not in allowed_types:
        raise BadRequestException("Only JPG, PNG, GIF, and WebP images are supported")

    try:
        scanner = get_food_scanner()
        analysis = await scanner.analyze_food_image(image)
        return FoodScanResponse(success=True, analysis=analysis)
    except HTTPException as exc:
        return FoodScanResponse(success=False, error=str(exc.detail))
    except Exception as exc:
        logger.error("Error in food scanner endpoint: %s", exc)
        return FoodScanResponse(success=False, error=str(exc))
