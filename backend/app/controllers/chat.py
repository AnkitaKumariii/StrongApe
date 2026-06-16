from sqlalchemy.ext.asyncio import AsyncSession
from app.services.chat import ChatService
from app.schemas.chat import ChatThreadOut, ChatMessageOut, ChatMessageCreate
from app.models.user import User
from typing import List

class ChatController:
    @staticmethod
    async def create_thread(db: AsyncSession, user: User, recipient_id: int) -> ChatThreadOut:
        thread = await ChatService.create_or_get_direct_thread(db=db, user_id_1=user.id, user_id_2=recipient_id)
        partners = [p.user for p in thread.participants if p.user_id != user.id]
        if not partners:
            partners = [p.user for p in thread.participants]
        return ChatThreadOut(
            id=thread.id,
            created_at=thread.created_at,
            participants=partners,
            last_message=None,
            unread_count=0
        )

    @staticmethod
    async def list_threads(db: AsyncSession, user: User) -> List[ChatThreadOut]:
        data = await ChatService.list_threads(db=db, user_id=user.id)
        results = []
        for item in data:
            last_msg_out = None
            if item["last_message"]:
                lm = item["last_message"]
                last_msg_out = ChatMessageOut(
                    id=lm.id,
                    thread_id=lm.thread_id,
                    sender_id=lm.sender_id,
                    content=lm.content,
                    is_read=lm.is_read,
                    created_at=lm.created_at
                )
            results.append(ChatThreadOut(
                id=item["id"],
                created_at=item["created_at"],
                participants=item["participants"],
                last_message=last_msg_out,
                unread_count=item["unread_count"]
            ))
        return results

    @staticmethod
    async def get_messages(db: AsyncSession, user: User, thread_id: int) -> List[ChatMessageOut]:
        messages = await ChatService.get_thread_messages(db=db, thread_id=thread_id, user_id=user.id)
        return [ChatMessageOut.model_validate(m) for m in messages]

    @staticmethod
    async def send_message(
        db: AsyncSession, user: User, thread_id: int, message_in: ChatMessageCreate
    ) -> ChatMessageOut:
        msg = await ChatService.send_message(db=db, thread_id=thread_id, sender_id=user.id, obj_in=message_in)
        return ChatMessageOut.model_validate(msg)
