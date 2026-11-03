from datetime import date

import pytest

from app.domain.entities import DailyUsageRow
from app.repositories.usage_repository import UsageRepository
from app.services.pricing_service import PricingCatalog
from app.services.usage_service import UsageService


class FakeUsageRepository(UsageRepository):
    def __init__(self, rows: list[DailyUsageRow]) -> None:  # no super: no database needed
        self.rows = rows
        self.since: str | None = None

    def daily(self, since_day: str) -> list[DailyUsageRow]:
        self.since = since_day
        return self.rows


def _service(rows: list[DailyUsageRow]) -> tuple[UsageService, FakeUsageRepository]:
    repo = FakeUsageRepository(rows)
    return UsageService(repo, PricingCatalog(), lambda: date(2026, 11, 3)), repo


def test_empty_report() -> None:
    service, repo = _service([])
    report = service.report(7)
    assert repo.since == "2026-10-28"  # last 7 UTC days including today
    assert report.totals.total == 0
    assert report.totals.cost_usd == 0.0
    assert report.daily == []
    assert report.by_model == []


def test_report_aggregation() -> None:
    rows = [
        DailyUsageRow("2026-11-03", "claude-sonnet-4-5", 1_000_000, 0, 0, 0),
        DailyUsageRow("2026-11-02", "mystery-model", 10, 10, 0, 0),
        DailyUsageRow("2026-11-02", "claude-sonnet-4-5", 1_000_000, 1_000_000, 0, 0),
    ]
    report = _service(rows)[0].report(30)
    assert [(d.day, d.model) for d in report.daily] == [
        ("2026-11-02", "claude-sonnet-4-5"),
        ("2026-11-02", "mystery-model"),
        ("2026-11-03", "claude-sonnet-4-5"),
    ]
    sonnet, mystery = report.by_model
    assert sonnet.model == "claude-sonnet-4-5"
    assert sonnet.total == 3_000_000
    assert sonnet.cost_usd == pytest.approx(3 + 3 + 15)
    assert mystery.cost_usd is None
    assert report.daily[1].cost_usd is None
    assert report.totals.total == 3_000_020
    assert report.totals.cost_usd == pytest.approx(21.0)  # unknown cost excluded
    assert sonnet.share == pytest.approx(3_000_000 / 3_000_020)
    assert sum(m.share for m in report.by_model) == pytest.approx(1.0)
