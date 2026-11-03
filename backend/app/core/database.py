import logging
import sqlite3
from collections.abc import Iterator
from contextlib import contextmanager
from pathlib import Path

logger = logging.getLogger(__name__)

MIGRATIONS: tuple[str, ...] = (
    """
    CREATE TABLE usage_records (
        message_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        project TEXT NOT NULL,
        model TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        day TEXT NOT NULL,
        input_tokens INTEGER NOT NULL,
        output_tokens INTEGER NOT NULL,
        cache_read_tokens INTEGER NOT NULL,
        cache_write_tokens INTEGER NOT NULL
    );
    CREATE INDEX idx_usage_day ON usage_records (day, model);
    CREATE TABLE file_offsets (
        path TEXT PRIMARY KEY,
        offset INTEGER NOT NULL
    );
    CREATE TABLE kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
    );
    """,
)


class Database:
    """SQLite access. Each unit of work gets its own connection (threads-safe)."""

    def __init__(self, path: Path) -> None:
        self._path = path

    @contextmanager
    def connect(self) -> Iterator[sqlite3.Connection]:
        self._path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self._path, timeout=30)
        try:
            conn.row_factory = sqlite3.Row
            conn.execute("PRAGMA journal_mode=WAL")
            conn.execute("PRAGMA foreign_keys=ON")
            yield conn
            conn.commit()
        except BaseException:
            conn.rollback()
            raise
        finally:
            conn.close()

    def migrate(self) -> None:
        with self.connect() as conn:
            conn.execute("CREATE TABLE IF NOT EXISTS schema_version (version INTEGER NOT NULL)")
            row = conn.execute("SELECT COALESCE(MAX(version), 0) AS v FROM schema_version")
            current = int(row.fetchone()["v"])
            for version, script in enumerate(MIGRATIONS, start=1):
                if version <= current:
                    continue
                conn.executescript(script)
                conn.execute("INSERT INTO schema_version (version) VALUES (?)", (version,))
                logger.info("Applied migration %d", version)

    def ping(self) -> bool:
        try:
            with self.connect() as conn:
                conn.execute("SELECT 1")
        except (sqlite3.Error, OSError):
            logger.exception("Database ping failed")
            return False
        return True
