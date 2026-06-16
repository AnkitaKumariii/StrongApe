from typing import List, Optional, Tuple
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy import func
from app.models.chat import ChatThread, ChatThreadParticipant, ChatMessage
from app.models.user import User
from app.schemas.chat import ChatMessageCreate
from app.core.errors import NotFoundException, BadRequestException, ForbiddenException

class ChatService:
    @staticmethod
    async def create_or_get_direct_thread(db: AsyncSession, user_id_1: int, user_id_2: int) -> ChatThread:
        if user_id_1 == user_id_2:
            raise BadRequestException("Cannot create a chat thread with yourself")
            
        # Check if user 2 exists
        u2_check = await db.execute(select(User).where(User.id == user_id_2))
        if not u2_check.scalars().first():
            raise NotFoundException("Recipient user not found")
            
        # Find if a thread already exists with exactly these two participants
        # We can find thread IDs where participant is user_id_1, then check if same thread has user_id_2
        stmt = (
            select(ChatThreadParticipant.thread_id)
            .where(ChatThreadParticipant.user_id.in_([user_id_1, user_id_2]))
            .group_by(ChatThreadParticipant.thread_id)
            .having(func.count(ChatThreadParticipant.user_id) == 2)
        )
        existing_threads_res = await db.execute(stmt)
        existing_thread_id = existing_threads_res.scalars().first()
        
        if existing_thread_id:
            # Return existing thread
            result = await db.execute(
                select(ChatThread)
                .where(ChatThread.id == existing_thread_id)
                .options(selectinload(ChatThread.participants).selectinload(ChatThreadParticipant.user))
            )
            return result.scalars().first()
            
        # Create a new thread
        new_thread = ChatThread()
        db.add(new_thread)
        await db.commit()
        await db.refresh(new_thread)
        
        # Add participants
        p1 = ChatThreadParticipant(thread_id=new_thread.id, user_id=user_id_1)
        p2 = ChatThreadParticipant(thread_id=new_thread.id, user_id=user_id_2)
        db.add_all([p1, p2])
        await db.commit()
        
        # Retrieve full object
        result = await db.execute(
            select(ChatThread)
            .where(ChatThread.id == new_thread.id)
            .options(selectinload(ChatThread.participants).selectinload(ChatThreadParticipant.user))
        )
        return result.scalars().first()

    @staticmethod
    async def list_threads(db: AsyncSession, user_id: int) -> List[dict]:
        # Get thread IDs the user belongs to
        user_threads_stmt = select(ChatThreadParticipant.thread_id).where(ChatThreadParticipant.user_id == user_id)
        
        result = await db.execute(
            select(ChatThread)
            .where(ChatThread.id.in_(user_threads_stmt))
            .options(
                selectinload(ChatThread.participants).selectinload(ChatThreadParticipant.user),
                selectinload(ChatThread.messages)
            )
        )
        threads = result.scalars().all()
        
        results = []
        for t in threads:
            # Participants list (exclude the current user from list of chat partners, or list everyone)
            partners = [p.user for p in t.participants if p.user_id != user_id]
            # Fallback to display the whole participant list if empty
            if not partners:
                partners = [p.user for p in t.participants]
                
            # Last message
            last_msg = None
            if t.messages:
                # Sort messages by created_at desc or id desc locally
                sorted_msgs = sorted(t.messages, key=lambda m: m.created_at, reverse=True)
                last_msg = sorted_msgs[0]
                
            # Unread count (messages sent by others to this thread that are is_read=False)
            unread_count = sum(1 for m in t.messages if m.sender_id != user_id and not m.is_read)
            
            results.append({
                "id": t.id,
                "created_at": t.created_at,
                "participants": partners,
                "last_message": last_msg,
                "unread_count": unread_count
            })
            
        # Sort threads by last message created_at desc or thread created_at desc
        results.sort(
            key=lambda x: x["last_message"].created_at if x["last_message"] else x["created_at"],
            reverse=True
        )
        return results

    @staticmethod
    async def get_thread_messages(db: AsyncSession, thread_id: int, user_id: int) -> List[ChatMessage]:
        # Verify user is participant
        part_check = await db.execute(
            select(ChatThreadParticipant).where(
                (ChatThreadParticipant.thread_id == thread_id) & 
                (ChatThreadParticipant.user_id == user_id)
            )
        )
        if not part_check.scalars().first():
            raise ForbiddenException("You do not have access to this chat thread")
            
        # Get messages
        msg_result = await db.execute(
            select(ChatMessage)
            .where(ChatMessage.thread_id == thread_id)
            .order_by(ChatMessage.created_at.asc())
        )
        messages = list(msg_result.scalars().all())
        
        # Mark messages sent by others as read
        unread_messages = [m for m in messages if m.sender_id != user_id and not m.is_read]
        if unread_messages:
            for m in unread_messages:
                m.is_read = True
                db.add(m)
            await db.commit()
            
        return messages

    @staticmethod
    async def send_message(
        db: AsyncSession, thread_id: int, sender_id: int, obj_in: ChatMessageCreate
    ) -> ChatMessage:
        # Verify user is participant
        part_check = await db.execute(
            select(ChatThreadParticipant).where(
                (ChatThreadParticipant.thread_id == thread_id) & 
                (ChatThreadParticipant.user_id == sender_id)
            )
        )
        if not part_check.scalars().first():
            raise ForbiddenException("You do not have access to post in this chat thread")
            
        db_msg = ChatMessage(
            thread_id=thread_id,
            sender_id=sender_id,
            content=obj_in.content
        )
        db.add(db_msg)
        await db.commit()
        await db.refresh(db_msg)
        return db_msg
