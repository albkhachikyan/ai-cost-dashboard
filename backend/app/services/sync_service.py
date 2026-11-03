import asyncio
import logging
from datetime import UTC, datetime
from pathlib import Path

from app.core.errors import NotConnectedError, SourceNotFoundError, SyncInProgressError
from app.domain.entities import ConnectionStatus, SyncResult
from app.repositories.sync_state_repository import SyncStateRepository
from app.repositories.usage_repository import UsageRepository
from app.services.transcript_parser import ClaudeCodeTranscriptParser

logger = logging.getLogger(__name__)


class SyncService:
    def __init__(
        self,
        source_dir: Path,
        parser: ClaudeCodeTranscriptParser,
        usage_repo: UsageRepository,
        state_repo: SyncStateRepository,
    ) -> None:
        self._source_dir = source_dir
        self._parser = parser
        self._usage_repo = usage_repo
        self._state_repo = state_repo
        self._lock = asyncio.Lock()

    async def connect(self) -> SyncResult:
        if not self._source_dir.is_dir():
            raise SourceNotFoundError
        await asyncio.to_thread(self._state_repo.set_connected, connected=True)
        return await self.sync()

    async def disconnect(self) -> None:
        await asyncio.to_thread(self._state_repo.set_connected, connected=False)

    def status(self) -> ConnectionStatus:
        return ConnectionStatus(
            connected=self._state_repo.is_connected(),
            source_found=self._source_dir.is_dir(),
            last_sync_at=self._state_repo.get_last_sync_at(),
            messages=self._usage_repo.count(),
        )

    async def sync(self) -> SyncResult:
        if not await asyncio.to_thread(self._state_repo.is_connected):
            raise NotConnectedError
        if self._lock.locked():
            raise SyncInProgressError
        async with self._lock:
            return await asyncio.to_thread(self._sync_blocking)

    async def run_forever(self, interval_s: float) -> None:
        while True:
            try:
                if await asyncio.to_thread(self._state_repo.is_connected) and (
                    not self._lock.locked()
                ):
                    result = await self.sync()
                    logger.info("Background sync: %d imported", result.imported)
            except Exception:
                logger.exception("Background sync failed")
            await asyncio.sleep(interval_s)

    def _sync_blocking(self) -> SyncResult:
        imported = 0
        skipped = 0
        for path in sorted(self._source_dir.glob("**/*.jsonl")):
            if not path.is_file():
                continue
            key = str(path)
            try:
                result = self._parser.parse_file(path, self._state_repo.get_offset(key))
            except OSError:
                logger.exception("Cannot read %s", path)
                continue
            imported += self._usage_repo.insert_many(result.records)
            skipped += result.skipped
            self._state_repo.set_offset(key, result.new_offset)
        self._state_repo.set_last_sync_at(datetime.now(UTC).isoformat())
        return SyncResult(imported=imported, skipped=skipped)
