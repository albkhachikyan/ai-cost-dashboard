import asyncio
from pathlib import Path

import pytest

from app.core.database import Database
from app.core.errors import NotConnectedError, SourceNotFoundError, SyncInProgressError
from app.domain.entities import SyncResult
from app.repositories.sync_state_repository import SyncStateRepository
from app.repositories.usage_repository import UsageRepository
from app.services.sync_service import SyncService
from app.services.transcript_parser import ClaudeCodeTranscriptParser


def _build(tmp_path: Path, source: Path) -> tuple[SyncService, SyncStateRepository]:
    db = Database(tmp_path / "db" / "u.db")
    db.migrate()
    state = SyncStateRepository(db)
    service = SyncService(source, ClaudeCodeTranscriptParser(source), UsageRepository(db), state)
    return service, state


def test_connect_missing_source(tmp_path: Path) -> None:
    service, _ = _build(tmp_path, tmp_path / "missing")
    with pytest.raises(SourceNotFoundError):
        asyncio.run(service.connect())
    assert service.status().source_found is False


def test_sync_requires_connection(tmp_path: Path, projects_dir: Path) -> None:
    service, _ = _build(tmp_path, projects_dir)
    with pytest.raises(NotConnectedError):
        asyncio.run(service.sync())


def test_connect_sync_disconnect(tmp_path: Path, projects_dir: Path) -> None:
    service, _ = _build(tmp_path, projects_dir)
    first = asyncio.run(service.connect())
    assert first == SyncResult(imported=3, skipped=1)
    status = service.status()
    assert status.connected
    assert status.messages == 3
    assert status.last_sync_at is not None
    again = asyncio.run(service.sync())
    assert again.imported == 0
    asyncio.run(service.disconnect())
    assert service.status().connected is False


def test_sync_in_progress(tmp_path: Path, projects_dir: Path) -> None:
    service, state = _build(tmp_path, projects_dir)
    state.set_connected(connected=True)

    async def scenario() -> None:
        async with service._lock:
            with pytest.raises(SyncInProgressError):
                await service.sync()

    asyncio.run(scenario())


def test_loop_survives_exceptions(
    tmp_path: Path, projects_dir: Path, monkeypatch: pytest.MonkeyPatch
) -> None:
    service, state = _build(tmp_path, projects_dir)
    state.set_connected(connected=True)
    calls: list[int] = []

    async def flaky() -> SyncResult:
        calls.append(1)
        if len(calls) == 1:
            raise RuntimeError("boom")
        if len(calls) == 2:
            return SyncResult(0, 0)
        raise asyncio.CancelledError

    monkeypatch.setattr(service, "sync", flaky)
    with pytest.raises(asyncio.CancelledError):
        asyncio.run(service.run_forever(0.001))
    assert len(calls) == 3


def test_loop_skips_when_not_connected(tmp_path: Path, projects_dir: Path) -> None:
    service, _ = _build(tmp_path, projects_dir)

    async def scenario() -> None:
        with pytest.raises(TimeoutError):
            await asyncio.wait_for(service.run_forever(0.001), timeout=0.05)

    asyncio.run(scenario())
    assert service.status().messages == 0


def test_loop_skips_when_lock_busy(tmp_path: Path, projects_dir: Path) -> None:
    service, state = _build(tmp_path, projects_dir)
    state.set_connected(connected=True)

    async def scenario() -> None:
        async with service._lock:
            with pytest.raises(TimeoutError):
                await asyncio.wait_for(service.run_forever(0.001), timeout=0.05)

    asyncio.run(scenario())
    assert service.status().messages == 0
