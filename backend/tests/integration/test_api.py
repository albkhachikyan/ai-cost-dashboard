from pathlib import Path

import pytest
from fastapi import APIRouter
from fastapi.testclient import TestClient

from app.core.config import Settings
from app.main import create_app


def test_full_flow(client: TestClient) -> None:
    status = client.get("/api/connection").json()
    assert status == {"connected": False, "source_found": True, "last_sync_at": None, "messages": 0}

    assert client.post("/api/sync").status_code == 409
    assert client.post("/api/sync").json()["error"]["code"] == "NOT_CONNECTED"

    connected = client.post("/api/connection")
    assert connected.status_code == 200
    assert connected.json() == {"imported": 3, "skipped": 1}

    again = client.post("/api/sync")
    assert again.status_code == 200
    assert again.json() == {"imported": 0, "skipped": 0}  # idempotent

    status = client.get("/api/connection").json()
    assert status["connected"] is True
    assert status["messages"] == 3
    assert status["last_sync_at"] is not None

    assert client.delete("/api/connection").status_code == 204
    assert client.get("/api/connection").json()["connected"] is False
    assert client.get("/api/connection").json()["messages"] == 3  # data kept


def test_usage_report(client: TestClient) -> None:
    client.post("/api/connection")
    body = client.get("/api/usage", params={"days": 365}).json()
    assert body["days"] == 365
    assert body["totals"]["total"] == 3150 + 10 + 530
    assert [(d["day"], d["model"]) for d in body["daily"]] == [
        ("2026-11-02", "claude-opus-5-5"),
        ("2026-11-03", "claude-opus-5-5"),
        ("2026-11-03", "claude-sonnet-4-5"),
    ]
    assert body["by_model"][0]["model"] == "claude-opus-5-5"
    assert body["by_model"][0]["share"] == pytest.approx(3160 / 3690)
    assert body["totals"]["cost_usd"] > 0
    default = client.get("/api/usage").json()
    assert default["days"] == 30


@pytest.mark.parametrize("days", [0, 366, "abc"])
def test_usage_validation(client: TestClient, days: object) -> None:
    response = client.get("/api/usage", params={"days": days})
    assert response.status_code == 422
    assert response.json()["error"]["code"] == "VALIDATION_ERROR"


def test_connect_source_missing(tmp_path: Path) -> None:
    settings = Settings(CLAUDE_PROJECTS_DIR=tmp_path / "nope", DB_PATH=tmp_path / "u.db")
    with TestClient(create_app(settings)) as client:
        response = client.post("/api/connection")
        assert response.status_code == 409
        assert response.json()["error"]["code"] == "SOURCE_NOT_FOUND"
        assert client.get("/api/connection").json()["source_found"] is False


def test_unknown_route_uses_error_shape(client: TestClient) -> None:
    response = client.get("/api/nothing")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "NOT_FOUND"


def test_unexpected_error_is_generic_500(settings: Settings) -> None:
    app = create_app(settings)
    router = APIRouter()

    @router.get("/api/boom")
    def boom() -> None:
        raise RuntimeError

    app.include_router(router)
    with TestClient(app, raise_server_exceptions=False) as client:
        response = client.get("/api/boom")
    assert response.status_code == 500
    assert response.json() == {
        "error": {"code": "INTERNAL_ERROR", "message": "Internal server error"}
    }


def test_settings_bounds() -> None:
    with pytest.raises(ValueError, match=r"(?i)sync_interval_s"):
        Settings(SYNC_INTERVAL_S=5)
