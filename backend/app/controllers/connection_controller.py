from typing import Annotated

from fastapi import APIRouter, Depends, Response, status

from app.dependencies import get_sync_service
from app.schemas.connection import ConnectionStatusResponse, SyncResultResponse
from app.services.sync_service import SyncService

router = APIRouter(prefix="/api")

SyncDep = Annotated[SyncService, Depends(get_sync_service)]


@router.get("/connection")
def get_connection(service: SyncDep) -> ConnectionStatusResponse:
    return ConnectionStatusResponse.model_validate(service.status(), from_attributes=True)


@router.post("/connection")
async def connect(service: SyncDep) -> SyncResultResponse:
    return SyncResultResponse.model_validate(await service.connect(), from_attributes=True)


@router.delete("/connection", status_code=status.HTTP_204_NO_CONTENT)
async def disconnect(service: SyncDep) -> Response:
    await service.disconnect()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/sync")
async def sync(service: SyncDep) -> SyncResultResponse:
    return SyncResultResponse.model_validate(await service.sync(), from_attributes=True)
