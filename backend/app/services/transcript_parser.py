import dataclasses
import json
import logging
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from app.domain.entities import ParseResult, UsageRecord

logger = logging.getLogger(__name__)

SYNTHETIC_MODEL = "<synthetic>"


def _tokens(usage: dict[str, Any], key: str) -> int:
    value = usage.get(key)
    return value if isinstance(value, int) and not isinstance(value, bool) and value > 0 else 0


def _merge(a: UsageRecord, b: UsageRecord) -> UsageRecord:
    """Same message logged once per content block; early lines carry partial output_tokens."""
    return dataclasses.replace(
        a,
        input_tokens=max(a.input_tokens, b.input_tokens),
        output_tokens=max(a.output_tokens, b.output_tokens),
        cache_read_tokens=max(a.cache_read_tokens, b.cache_read_tokens),
        cache_write_tokens=max(a.cache_write_tokens, b.cache_write_tokens),
    )


class ClaudeCodeTranscriptParser:
    """Parses Claude Code .jsonl transcripts incrementally, from a byte offset."""

    def __init__(self, root: Path) -> None:
        self._root = root

    def parse_file(self, path: Path, offset: int) -> ParseResult:
        size = path.stat().st_size
        if size < offset:
            logger.warning("%s shrank below stored offset; re-reading from 0", path)
            offset = 0
        with path.open("rb") as handle:
            handle.seek(offset)
            data = handle.read()
        last_newline = data.rfind(b"\n")
        if last_newline < 0:
            return ParseResult((), 0, offset)
        chunk = data[: last_newline + 1]
        project = self._project_of(path)
        records: dict[str, UsageRecord] = {}
        skipped = 0
        for line in chunk.decode("utf-8", errors="replace").split("\n"):
            if not line.strip():
                continue
            try:
                parsed = self._parse_line(line, project)
            except ValueError:
                logger.warning("Skipping malformed line in %s", path)
                skipped += 1
                continue
            if parsed is not None:
                prev = records.get(parsed.message_id)
                records[parsed.message_id] = parsed if prev is None else _merge(prev, parsed)
        return ParseResult(tuple(records.values()), skipped, offset + len(chunk))

    def _project_of(self, path: Path) -> str:
        try:
            return path.relative_to(self._root).parts[0]
        except (ValueError, IndexError):
            return path.parent.name

    @staticmethod
    def _parse_line(line: str, project: str) -> UsageRecord | None:
        """Return a record, None if the line is irrelevant. Raises ValueError if malformed."""
        obj = json.loads(line)
        if not isinstance(obj, dict):
            raise ValueError  # noqa: TRY004
        message = obj.get("message")
        if not isinstance(message, dict):
            return None
        usage = message.get("usage")
        model = message.get("model")
        message_id = message.get("id")
        if not isinstance(usage, dict) or not isinstance(model, str) or model == SYNTHETIC_MODEL:
            return None
        if not isinstance(message_id, str) or not message_id:
            return None
        moment = datetime.fromisoformat(str(obj.get("timestamp"))).astimezone(UTC)
        return UsageRecord(
            message_id=message_id,
            session_id=str(obj.get("sessionId", "")),
            project=project,
            model=model,
            timestamp=moment.isoformat(),
            day=moment.date().isoformat(),
            input_tokens=_tokens(usage, "input_tokens"),
            output_tokens=_tokens(usage, "output_tokens"),
            cache_read_tokens=_tokens(usage, "cache_read_input_tokens"),
            cache_write_tokens=_tokens(usage, "cache_creation_input_tokens"),
        )
