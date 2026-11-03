from pathlib import Path

from app.services.transcript_parser import ClaudeCodeTranscriptParser

FIXTURE = Path(__file__).parent.parent / "fixtures" / "sample.jsonl"


def _parser(root: Path) -> ClaudeCodeTranscriptParser:
    return ClaudeCodeTranscriptParser(root)


def test_parses_fixture(projects_dir: Path) -> None:
    path = projects_dir / "-Users-me-proj" / "session.jsonl"
    result = _parser(projects_dir).parse_file(path, 0)
    by_id = {r.message_id: r for r in result.records}
    assert set(by_id) == {"msg_A", "msg_B", "msg_C"}  # dedup, synthetic and user skipped
    assert result.skipped == 1  # malformed line
    assert result.new_offset == path.stat().st_size
    a = by_id["msg_A"]
    assert (a.input_tokens, a.output_tokens, a.cache_read_tokens, a.cache_write_tokens) == (
        100,
        50,
        2000,
        1000,
    )
    assert a.day == "2026-11-02"
    assert a.project == "-Users-me-proj"
    assert a.session_id == "s1"
    assert by_id["msg_C"].cache_read_tokens == 0
    assert by_id["msg_B"].model == "claude-sonnet-4-5"
    assert by_id["msg_B"].day == "2026-11-03"


def test_resume_from_offset_returns_nothing(projects_dir: Path) -> None:
    path = projects_dir / "-Users-me-proj" / "session.jsonl"
    parser = _parser(projects_dir)
    first = parser.parse_file(path, 0)
    second = parser.parse_file(path, first.new_offset)
    assert second.records == ()
    assert second.new_offset == first.new_offset


def test_partial_last_line_is_not_consumed(tmp_path: Path) -> None:
    line = FIXTURE.read_text().splitlines()[-1]
    path = tmp_path / "proj" / "s.jsonl"
    path.parent.mkdir()
    path.write_bytes(line.encode() + b"\n" + line.replace("msg_C", "msg_D").encode()[:40])
    parser = _parser(tmp_path)
    first = parser.parse_file(path, 0)
    assert [r.message_id for r in first.records] == ["msg_C"]
    assert first.new_offset == len(line) + 1
    with path.open("ab") as handle:
        handle.write(line.replace("msg_C", "msg_D").encode()[40:] + b"\n")
    second = parser.parse_file(path, first.new_offset)
    assert [r.message_id for r in second.records] == ["msg_D"]


def test_no_newline_at_all(tmp_path: Path) -> None:
    path = tmp_path / "p" / "s.jsonl"
    path.parent.mkdir()
    path.write_bytes(b'{"partial":')
    result = _parser(tmp_path).parse_file(path, 0)
    assert (result.records, result.skipped, result.new_offset) == ((), 0, 0)


def test_truncated_file_restarts_from_zero(tmp_path: Path) -> None:
    line = FIXTURE.read_text().splitlines()[-1]
    path = tmp_path / "p" / "s.jsonl"
    path.parent.mkdir()
    path.write_text(line + "\n")
    result = _parser(tmp_path).parse_file(path, 10_000)
    assert [r.message_id for r in result.records] == ["msg_C"]
    assert result.new_offset == len(line) + 1


def test_bad_shapes_are_skipped_or_ignored(tmp_path: Path) -> None:
    path = tmp_path / "s.jsonl"
    lines = [
        "[1, 2]",  # not an object -> skipped
        '{"timestamp":"nope","message":{"id":"m","model":"x","usage":{}}}',  # bad ts -> skipped
        '{"message":"str"}',  # ignored
        '{"message":{"id":"","model":"x","usage":{}}}',  # no id -> ignored
        "",
        '{"timestamp":"2026-11-03T00:00:00Z","message":{"id":"ok","model":"x",'
        '"usage":{"input_tokens":true,"output_tokens":"7"}}}',
    ]
    path.write_bytes(("\n".join(lines) + "\n").encode() + b"\xff\n")
    result = _parser(tmp_path).parse_file(path, 0)
    assert result.skipped == 3  # two above plus invalid utf-8 line (replaced -> bad json)
    assert len(result.records) == 1
    assert result.records[0].input_tokens == 0
    assert result.records[0].output_tokens == 0


def test_project_falls_back_when_outside_root(tmp_path: Path) -> None:
    other = tmp_path / "elsewhere" / "proj" / "s.jsonl"
    other.parent.mkdir(parents=True)
    other.write_text(FIXTURE.read_text().splitlines()[-1] + "\n")
    result = _parser(tmp_path / "root").parse_file(other, 0)
    assert result.records[0].project == "proj"
