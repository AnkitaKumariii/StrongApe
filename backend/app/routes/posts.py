from fastapi import APIRouter, Depends, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.post import PostController
from app.schemas.post import PostCreate, PostOut, LikeToggle
from app.models.user import User
from app.core.errors import BadRequestException
from typing import List
import os
import uuid

router = APIRouter()

@router.post("/attach-media")
async def upload_image(
    file: UploadFile = File(...)
):
    # Validate extension and content type
    allowed_types = ["image/jpeg", "image/png"]
    ext = os.path.splitext(file.filename)[1].lower()
    if file.content_type not in allowed_types or ext not in [".jpg", ".jpeg", ".png"]:
        raise BadRequestException("Only JPG and PNG files are allowed.")
        
    # Ensure static directory exists
    from app.core.config import settings
    upload_dir = os.path.join(settings.STATIC_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save the file
    try:
        content = await file.read()
        with open(file_path, "wb") as f:
            f.write(content)
    except Exception as e:
        raise BadRequestException(f"Could not save file: {str(e)}")
        
    return {"image_url": f"/static/uploads/{unique_filename}"}

@router.post("", response_model=PostOut)
async def create_post(
    post_in: PostCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await PostController.create_post(db=db, user=current_user, post_in=post_in)

@router.get("", response_model=List[PostOut])
async def get_feed(
    limit: int = Query(20, ge=1, le=100),
    skip: int = Query(0, ge=0),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await PostController.get_feed(db=db, user=current_user, limit=limit, skip=skip)

@router.post("/{post_id}/like", response_model=LikeToggle)
async def toggle_like(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await PostController.toggle_like(db=db, user=current_user, post_id=post_id)

@router.delete("/{post_id}")
async def delete_post(
    post_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    await PostController.delete_post(db=db, user=current_user, post_id=post_id)
    return {"success": True, "message": "Post deleted successfully"}
