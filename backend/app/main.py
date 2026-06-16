import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.core.errors import register_error_handlers
from app.routes.api import api_router
import app.models  # noqa: F401 — register all ORM models before create_all

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for StrongApe - the gamified fitness social network",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Set CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router, prefix="/api")

# Register global error handlers
register_error_handlers(app)

@app.on_event("startup")
async def on_startup():
    try:
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
    except Exception as exc:
        logger.error(
            "Database connection failed (%s). Check DATABASE_URL in backend/.env — "
            "use SQLite for local dev or start PostgreSQL with `docker-compose up -d`.",
            settings.DATABASE_URL,
        )
        raise exc

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "healthy",
        "docs": "/docs"
    }
