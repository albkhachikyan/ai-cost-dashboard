from app.core.database import Database

CONNECTED_KEY = "connected"
LAST_SYNC_KEY = "last_sync_at"


class SyncStateRepository:
    def __init__(self, database: Database) -> None:
        self._db = database

    def get_offset(self, path: str) -> int:
        with self._db.connect() as conn:
            row = conn.execute("SELECT offset FROM file_offsets WHERE path = ?", (path,)).fetchone()
            return int(row["offset"]) if row else 0

    def set_offset(self, path: str, offset: int) -> None:
        with self._db.connect() as conn:
            conn.execute(
                "INSERT INTO file_offsets (path, offset) VALUES (?, ?)"
                " ON CONFLICT(path) DO UPDATE SET offset = excluded.offset",
                (path, offset),
            )

    def get_value(self, key: str) -> str | None:
        with self._db.connect() as conn:
            row = conn.execute("SELECT value FROM kv WHERE key = ?", (key,)).fetchone()
            return str(row["value"]) if row else None

    def set_value(self, key: str, value: str) -> None:
        with self._db.connect() as conn:
            conn.execute(
                "INSERT INTO kv (key, value) VALUES (?, ?)"
                " ON CONFLICT(key) DO UPDATE SET value = excluded.value",
                (key, value),
            )

    def is_connected(self) -> bool:
        return self.get_value(CONNECTED_KEY) == "1"

    def set_connected(self, *, connected: bool) -> None:
        self.set_value(CONNECTED_KEY, "1" if connected else "0")

    def get_last_sync_at(self) -> str | None:
        return self.get_value(LAST_SYNC_KEY)

    def set_last_sync_at(self, value: str) -> None:
        self.set_value(LAST_SYNC_KEY, value)
