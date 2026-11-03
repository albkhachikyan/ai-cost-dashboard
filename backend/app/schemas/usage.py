from pydantic import BaseModel


class TokenTotals(BaseModel):
    input: int
    output: int
    cache_read: int
    cache_write: int
    total: int
    cost_usd: float | None


class DailyUsage(TokenTotals):
    day: str
    model: str


class ModelUsage(TokenTotals):
    model: str
    share: float


class UsageReport(BaseModel):
    days: int
    totals: TokenTotals
    daily: list[DailyUsage]
    by_model: list[ModelUsage]
