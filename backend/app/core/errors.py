import logging
from http import HTTPStatus

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base for expected, client-visible errors."""

    code = "APP_ERROR"
    status = HTTPStatus.INTERNAL_SERVER_ERROR
    default_message = "Application error"

    def __init__(self, message: str | None = None) -> None:
        self.message = message or self.default_message
        super().__init__(self.message)


class SourceNotFoundError(AppError):
    code = "SOURCE_NOT_FOUND"
    status = HTTPStatus.CONFLICT
    default_message = "Claude projects directory was not found"


class NotConnectedError(AppError):
    code = "NOT_CONNECTED"
    status = HTTPStatus.CONFLICT
    default_message = "Not connected to a Claude Code source"


class SyncInProgressError(AppError):
    code = "SYNC_IN_PROGRESS"
    status = HTTPStatus.CONFLICT
    default_message = "A sync is already in progress"


class DatabaseUnavailableError(AppError):
    code = "DB_UNAVAILABLE"
    status = HTTPStatus.SERVICE_UNAVAILABLE
    default_message = "Database is unavailable"


def _body(code: str, message: str) -> dict[str, dict[str, str]]:
    return {"error": {"code": code, "message": message}}


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def handle_app_error(_: Request, exc: AppError) -> JSONResponse:
        return JSONResponse(_body(exc.code, exc.message), status_code=exc.status)

    @app.exception_handler(RequestValidationError)
    async def handle_validation(_: Request, exc: RequestValidationError) -> JSONResponse:
        detail = "; ".join(
            f"{'.'.join(str(p) for p in e['loc'])}: {e['msg']}" for e in exc.errors()
        )
        return JSONResponse(_body("VALIDATION_ERROR", detail), status_code=422)

    @app.exception_handler(StarletteHTTPException)
    async def handle_http(_: Request, exc: StarletteHTTPException) -> JSONResponse:
        code = HTTPStatus(exc.status_code).name
        return JSONResponse(_body(code, HTTPStatus(exc.status_code).phrase), exc.status_code)

    @app.exception_handler(Exception)
    async def handle_unexpected(_: Request, exc: Exception) -> JSONResponse:
        logger.error("Unhandled error", exc_info=exc)
        return JSONResponse(_body("INTERNAL_ERROR", "Internal server error"), status_code=500)
