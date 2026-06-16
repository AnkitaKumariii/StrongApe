from fastapi import APIRouter
from app.routes.auth import router as auth_router
from app.routes.users import router as users_router
from app.routes.checkin import router as checkin_router
from app.routes.posts import router as posts_router
from app.routes.communities import router as communities_router
from app.routes.challenges import router as challenges_router
from app.routes.chats import router as chats_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["auth"])
api_router.include_router(users_router, prefix="/users", tags=["users"])
api_router.include_router(checkin_router, prefix="/checkin", tags=["checkin"])
api_router.include_router(posts_router, prefix="/posts", tags=["posts"])
api_router.include_router(communities_router, prefix="/communities", tags=["communities"])
api_router.include_router(challenges_router, prefix="/challenges", tags=["challenges"])
api_router.include_router(chats_router, prefix="/chats", tags=["chats"])
