from pydantic import BaseModel


class ConnectionStatusResponse(BaseModel):
    connected: bool
    source_found: bool
    last_sync_at: str | None
    messages: int


class SyncResultResponse(BaseModel):
    imported: int
    skipped: int


class HealthResponse(BaseModel):
    status: str
    db: str
