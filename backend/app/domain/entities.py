from dataclasses import dataclass


@dataclass(frozen=True, slots=True)
class UsageRecord:
    message_id: str
    session_id: str
    project: str
    model: str
    timestamp: str
    day: str
    input_tokens: int
    output_tokens: int
    cache_read_tokens: int
    cache_write_tokens: int


@dataclass(frozen=True, slots=True)
class ModelPrice:
    """USD per million tokens."""

    input: float
    output: float
    cache_write: float
    cache_read: float


@dataclass(frozen=True, slots=True)
class ParseResult:
    records: tuple[UsageRecord, ...]
    skipped: int
    new_offset: int


@dataclass(frozen=True, slots=True)
class SyncResult:
    imported: int
    skipped: int


@dataclass(frozen=True, slots=True)
class ConnectionStatus:
    connected: bool
    source_found: bool
    last_sync_at: str | None
    messages: int


@dataclass(frozen=True, slots=True)
class DailyUsageRow:
    day: str
    model: str
    input_tokens: int
    output_tokens: int
    cache_read_tokens: int
    cache_write_tokens: int


@dataclass(frozen=True, slots=True)
class HourlyUsageRow:
    hour: int
    model: str
    input_tokens: int
    output_tokens: int
    cache_read_tokens: int
    cache_write_tokens: int
