from pathlib import Path

from fastapi.testclient import TestClient

from app.core.config import Settings
from app.dependencies import build_container
from app.main import create_app


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "db": "ok"}


def test_health_db_unavailable(tmp_path: Path) -> None:
    blocker = tmp_path / "file"
    blocker.write_text("x")
    settings = Settings(DB_PATH=blocker / "sub" / "u.db")
    app = create_app(settings)
    app.state.container = build_container(settings)
    response = TestClient(app).get("/api/health")  # no lifespan: no migrate
    assert response.status_code == 503
    assert response.json()["error"]["code"] == "DB_UNAVAILABLE"
