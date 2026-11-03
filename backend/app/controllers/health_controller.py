from typing import Annotated

from fastapi import APIRouter, Depends

from app.core.database import Database
from app.core.errors import DatabaseUnavailableError
from app.dependencies import get_database
from app.schemas.connection import HealthResponse

router = APIRouter(prefix="/api")


@router.get("/health")
def health(database: Annotated[Database, Depends(get_database)]) -> HealthResponse:
    if not database.ping():
        raise DatabaseUnavailableError
    return HealthResponse(status="ok", db="ok")
