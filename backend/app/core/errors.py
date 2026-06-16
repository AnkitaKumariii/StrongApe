from typing import Any
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

class AppException(Exception):
    def __init__(self, status_code: int, message: str, details: Any = None):
        self.status_code = status_code
        self.message = message
        self.details = details
        super().__init__(message)

class NotFoundException(AppException):
    def __init__(self, message: str = "Resource not found", details: Any = None):
        super().__init__(status.HTTP_404_NOT_FOUND, message, details)

class UnauthorizedException(AppException):
    def __init__(self, message: str = "Could not validate credentials", details: Any = None):
        super().__init__(status.HTTP_401_UNAUTHORIZED, message, details)

class ForbiddenException(AppException):
    def __init__(self, message: str = "Permission denied", details: Any = None):
        super().__init__(status.HTTP_403_FORBIDDEN, message, details)

class BadRequestException(AppException):
    def __init__(self, message: str = "Bad request", details: Any = None):
        super().__init__(status.HTTP_400_BAD_REQUEST, message, details)

def register_error_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "success": False,
                "error": {
                    "code": exc.status_code,
                    "message": exc.message,
                    "details": exc.details
                }
            }
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(request: Request, exc: RequestValidationError):
        errors = []
        for err in exc.errors():
            errors.append({
                "loc": err.get("loc"),
                "msg": err.get("msg"),
                "type": err.get("type")
            })
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "success": False,
                "error": {
                    "code": 422,
                    "message": "Validation Error",
                    "details": errors
                }
            }
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        # In real production, log the traceback here
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "success": False,
                "error": {
                    "code": 500,
                    "message": "Internal Server Error",
                    "details": str(exc) if settings_debug_enabled(app) else None
                }
            }
        )

def settings_debug_enabled(app: FastAPI) -> bool:
    try:
        from app.core.config import settings
        return settings.DEBUG
    except Exception:
        return True
