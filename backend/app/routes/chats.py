from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import get_db
from app.routes.deps import get_current_user
from app.controllers.chat import ChatController
from app.schemas.chat import ChatThreadOut, ChatMessageOut, ChatMessageCreate
from app.models.user import User
from typing import List

router = APIRouter()

@router.get("/threads", response_model=List[ChatThreadOut])
async def list_threads(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChatController.list_threads(db=db, user=current_user)

@router.post("/threads", response_model=ChatThreadOut, status_code=status.HTTP_201_CREATED)
async def create_thread(
    recipient_id: int = Query(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChatController.create_thread(db=db, user=current_user, recipient_id=recipient_id)

@router.get("/threads/{thread_id}/messages", response_model=List[ChatMessageOut])
async def get_messages(
    thread_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChatController.get_messages(db=db, user=current_user, thread_id=thread_id)

@router.post("/threads/{thread_id}/messages", response_model=ChatMessageOut, status_code=status.HTTP_201_CREATED)
async def send_message(
    thread_id: int,
    message_in: ChatMessageCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChatController.send_message(db=db, user=current_user, thread_id=thread_id, message_in=message_in)

@router.delete("/threads/{thread_id}/messages/{message_id}", status_code=status.HTTP_200_OK)
async def delete_message(
    thread_id: int,
    message_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChatController.delete_message(db=db, user=current_user, thread_id=thread_id, message_id=message_id)

@router.delete("/threads/{thread_id}", status_code=status.HTTP_200_OK)
async def delete_thread(
    thread_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return await ChatController.delete_thread(db=db, user=current_user, thread_id=thread_id)
