from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import Base, engine
from app.core.errors import register_error_handlers
from app.routes.api import api_router

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
    allow_origins=["*"],  # Adjust in production
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
    # Automatically create tables for local development
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "status": "healthy",
        "docs": "/docs"
    }
