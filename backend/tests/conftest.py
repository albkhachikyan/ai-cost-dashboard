import shutil
from collections.abc import Iterator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app

FIXTURE = Path(__file__).parent / "fixtures" / "sample.jsonl"


@pytest.fixture
def projects_dir(tmp_path: Path) -> Path:
    root = tmp_path / "projects"
    project = root / "-Users-me-proj"
    project.mkdir(parents=True)
    shutil.copy(FIXTURE, project / "session.jsonl")
    return root


@pytest.fixture
def settings(tmp_path: Path, projects_dir: Path) -> Settings:
    return Settings(CLAUDE_PROJECTS_DIR=projects_dir, DB_PATH=tmp_path / "data" / "usage.db")


@pytest.fixture
def client(settings: Settings) -> Iterator[TestClient]:
    with TestClient(create_app(settings)) as test_client:
        yield test_client
