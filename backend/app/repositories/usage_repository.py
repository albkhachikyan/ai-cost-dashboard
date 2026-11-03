import sqlite3

from app.core.database import Database
from app.domain.entities import DailyUsageRow, UsageRecord


class UsageRepository:
    def __init__(self, database: Database) -> None:
        self._db = database

    def insert_many(self, records: tuple[UsageRecord, ...]) -> int:
        """Upsert by message id keeping the max of each token field (streamed lines carry
        partial counts, possibly across syncs). Returns the number of new message ids."""
        if not records:
            return 0
        rows = [
            (
                r.message_id,
                r.session_id,
                r.project,
                r.model,
                r.timestamp,
                r.day,
                r.input_tokens,
                r.output_tokens,
                r.cache_read_tokens,
                r.cache_write_tokens,
            )
            for r in records
        ]
        with self._db.connect() as conn:
            before = self._count(conn)
            conn.executemany(
                "INSERT INTO usage_records (message_id, session_id, project, model,"
                " timestamp, day, input_tokens, output_tokens, cache_read_tokens,"
                " cache_write_tokens) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)"
                " ON CONFLICT(message_id) DO UPDATE SET"
                " input_tokens = MAX(input_tokens, excluded.input_tokens),"
                " output_tokens = MAX(output_tokens, excluded.output_tokens),"
                " cache_read_tokens = MAX(cache_read_tokens, excluded.cache_read_tokens),"
                " cache_write_tokens = MAX(cache_write_tokens, excluded.cache_write_tokens)",
                rows,
            )
            return self._count(conn) - before

    def daily(self, since_day: str) -> list[DailyUsageRow]:
        with self._db.connect() as conn:
            cursor = conn.execute(
                "SELECT day, model, SUM(input_tokens) AS i, SUM(output_tokens) AS o,"
                " SUM(cache_read_tokens) AS cr, SUM(cache_write_tokens) AS cw"
                " FROM usage_records WHERE day >= ? GROUP BY day, model ORDER BY day, model",
                (since_day,),
            )
            return [
                DailyUsageRow(r["day"], r["model"], r["i"], r["o"], r["cr"], r["cw"])
                for r in cursor.fetchall()
            ]

    def count(self) -> int:
        with self._db.connect() as conn:
            return self._count(conn)

    @staticmethod
    def _count(conn: sqlite3.Connection) -> int:
        return int(conn.execute("SELECT COUNT(*) AS c FROM usage_records").fetchone()["c"])
