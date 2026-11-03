from typing import Annotated

from fastapi import APIRouter, Depends, Query

from app.dependencies import get_usage_service
from app.schemas.usage import UsageReport
from app.services.usage_service import UsageService

router = APIRouter(prefix="/api")


@router.get("/usage")
def get_usage(
    service: Annotated[UsageService, Depends(get_usage_service)],
    days: Annotated[int, Query(ge=1, le=365)] = 30,
) -> UsageReport:
    return service.report(days)
