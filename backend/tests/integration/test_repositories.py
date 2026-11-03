import dataclasses
from pathlib import Path

from app.core.database import Database
from app.domain.entities import UsageRecord
from app.repositories.sync_state_repository import SyncStateRepository
from app.repositories.usage_repository import UsageRepository


def _record(message_id: str, day: str = "2026-11-03", model: str = "m") -> UsageRecord:
    return UsageRecord(message_id, "s", "p", model, f"{day}T00:00:00+00:00", day, 1, 2, 3, 4)


def test_migrate_is_idempotent(tmp_path: Path) -> None:
    db = Database(tmp_path / "x" / "u.db")
    db.migrate()
    db.migrate()
    with db.connect() as conn:
        assert conn.execute("SELECT COUNT(*) FROM schema_version").fetchone()[0] == 1
    assert db.ping() is True


def test_ping_failure(tmp_path: Path) -> None:
    blocker = tmp_path / "file"
    blocker.write_text("x")
    assert Database(blocker / "sub" / "u.db").ping() is False


def test_usage_repository(tmp_path: Path) -> None:
    db = Database(tmp_path / "u.db")
    db.migrate()
    repo = UsageRepository(db)
    assert repo.insert_many(()) == 0
    assert repo.insert_many((_record("a"), _record("a"), _record("b", "2026-11-01"))) == 2
    assert repo.insert_many((_record("a"), _record("c"))) == 1
    assert repo.count() == 3
    rows = repo.daily("2026-11-02")
    assert len(rows) == 1
    assert (rows[0].day, rows[0].input_tokens, rows[0].cache_write_tokens) == ("2026-11-03", 2, 8)
    assert len(repo.daily("2026-01-01")) == 2


def test_sync_state_repository(tmp_path: Path) -> None:
    db = Database(tmp_path / "u.db")
    db.migrate()
    repo = SyncStateRepository(db)
    assert repo.get_offset("/a") == 0
    repo.set_offset("/a", 10)
    repo.set_offset("/a", 20)
    assert repo.get_offset("/a") == 20
    assert repo.is_connected() is False
    repo.set_connected(connected=True)
    assert repo.is_connected() is True
    assert repo.get_last_sync_at() is None
    repo.set_last_sync_at("t")
    assert repo.get_last_sync_at() == "t"


def test_upsert_keeps_final_streamed_counts(tmp_path: Path) -> None:
    """A message mid-stream at sync time is stored partial; the next sync must raise it."""
    db = Database(tmp_path / "u.db")
    db.migrate()
    repo = UsageRepository(db)
    partial = dataclasses.replace(_record("a"), output_tokens=8)
    final = dataclasses.replace(_record("a"), output_tokens=4650)
    assert repo.insert_many((partial,)) == 1
    assert repo.insert_many((final,)) == 0  # not a new message
    assert repo.insert_many((partial,)) == 0  # stale line never lowers it
    assert repo.daily("2026-01-01")[0].output_tokens == 4650
