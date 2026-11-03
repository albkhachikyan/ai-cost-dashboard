from collections.abc import Callable
from datetime import UTC, date, datetime, timedelta

from app.domain.entities import DailyUsageRow
from app.repositories.usage_repository import UsageRepository
from app.schemas.usage import DailyUsage, ModelUsage, TokenTotals, UsageReport
from app.services.pricing_service import PricingCatalog

COST_DECIMALS = 6


def _utc_today() -> date:
    return datetime.now(UTC).date()


class UsageService:
    def __init__(
        self,
        repo: UsageRepository,
        pricing: PricingCatalog,
        today: Callable[[], date] = _utc_today,
    ) -> None:
        self._repo = repo
        self._pricing = pricing
        self._today = today

    def report(self, days: int) -> UsageReport:
        since = self._today() - timedelta(days=days - 1)
        rows = self._repo.daily(since.isoformat())
        daily = [self._daily(row) for row in sorted(rows, key=lambda r: (r.day, r.model))]
        by_model = self._by_model(rows)
        total = sum(m.total for m in by_model)
        totals = TokenTotals(
            input=sum(m.input for m in by_model),
            output=sum(m.output for m in by_model),
            cache_read=sum(m.cache_read for m in by_model),
            cache_write=sum(m.cache_write for m in by_model),
            total=total,
            cost_usd=round(sum(m.cost_usd or 0.0 for m in by_model), COST_DECIMALS),
        )
        shares = [
            m.model_copy(update={"share": m.total / total if total else 0.0}) for m in by_model
        ]
        return UsageReport(days=days, totals=totals, daily=daily, by_model=shares)

    def _cost(self, model: str, row: DailyUsageRow) -> float | None:
        cost = self._pricing.cost(
            model,
            input_tokens=row.input_tokens,
            output_tokens=row.output_tokens,
            cache_read=row.cache_read_tokens,
            cache_write=row.cache_write_tokens,
        )
        return None if cost is None else round(cost, COST_DECIMALS)

    def _daily(self, row: DailyUsageRow) -> DailyUsage:
        return DailyUsage(
            day=row.day,
            model=row.model,
            input=row.input_tokens,
            output=row.output_tokens,
            cache_read=row.cache_read_tokens,
            cache_write=row.cache_write_tokens,
            total=row.input_tokens
            + row.output_tokens
            + row.cache_read_tokens
            + row.cache_write_tokens,
            cost_usd=self._cost(row.model, row),
        )

    def _by_model(self, rows: list[DailyUsageRow]) -> list[ModelUsage]:
        sums: dict[str, list[int]] = {}
        for r in rows:
            acc = sums.setdefault(r.model, [0, 0, 0, 0])
            acc[0] += r.input_tokens
            acc[1] += r.output_tokens
            acc[2] += r.cache_read_tokens
            acc[3] += r.cache_write_tokens
        result = []
        for model, (i, o, cr, cw) in sums.items():
            agg = DailyUsageRow("", model, i, o, cr, cw)
            result.append(
                ModelUsage(
                    model=model,
                    input=i,
                    output=o,
                    cache_read=cr,
                    cache_write=cw,
                    total=i + o + cr + cw,
                    cost_usd=self._cost(model, agg),
                    share=0.0,
                )
            )
        return sorted(result, key=lambda m: (-m.total, m.model))
