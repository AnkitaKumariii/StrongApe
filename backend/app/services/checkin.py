from datetime import date, timedelta
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.checkin import CheckIn
from app.models.user import User
from app.models.post import Post
from app.schemas.checkin import CheckInCreate
from app.core.errors import BadRequestException

class CheckInService:
    @staticmethod
    async def log_checkin(db: AsyncSession, user: User, checkin_in: CheckInCreate) -> CheckIn:
        today = date.today()
        
        # Check if user already checked in today
        check_existing = await db.execute(
            select(CheckIn).where((CheckIn.user_id == user.id) & (CheckIn.logged_at == today))
        )
        if check_existing.scalars().first():
            raise BadRequestException("You have already logged a workout check-in today!")
            
        # Determine streak update
        last_checkin = user.last_checkin
        if last_checkin is None:
            user.current_streak = 1
        elif last_checkin == today - timedelta(days=1):
            user.current_streak += 1
        elif last_checkin == today:
            pass # Already checked in (handled above, but just in case)
        else:
            user.current_streak = 1
            
        user.last_checkin = today
        
        # XP and Level updates
        # Check-in awards 200 XP
        xp_earned = 200
        user.xp += xp_earned
        
        # Simple level progression: level is floor(total_xp / 1000) + 1
        new_level = (user.xp // 1000) + 1
        level_up = new_level > user.level
        user.level = new_level
        
        # Create CheckIn log
        db_checkin = CheckIn(
            user_id=user.id,
            logged_at=today,
            duration_minutes=checkin_in.duration_minutes,
            intensity=checkin_in.intensity,
            notes=checkin_in.notes
        )
        db.add(db_checkin)
        db.add(user)
        
        # Automatically generate a social post about the workout check-in
        post_content = f"Logged a {checkin_in.duration_minutes}-minute {checkin_in.intensity} intensity workout! 💪"
        if checkin_in.notes:
            post_content += f"\nNotes: {checkin_in.notes}"
            
        metadata = {
            "checkin_id": None, # Will fill after saving or just dummy
            "duration": checkin_in.duration_minutes,
            "intensity": checkin_in.intensity,
            "streak": user.current_streak,
            "xp_gained": xp_earned,
            "level_up": level_up
        }
        
        db_post = Post(
            user_id=user.id,
            content=post_content,
            post_type="check_in",
            post_metadata=metadata
        )
        db.add(db_post)
        
        await db.commit()
        await db.refresh(db_checkin)
        await db.refresh(user)
        
        # Link checkin_id in post metadata
        db_post.post_metadata = {**metadata, "checkin_id": db_checkin.id}
        db.add(db_post)
        await db.commit()
        
        return db_checkin
