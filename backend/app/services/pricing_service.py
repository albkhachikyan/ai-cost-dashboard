from app.domain.entities import ModelPrice

# USD per million tokens: ModelPrice(input, output, cache_write, cache_read)
# cache_write = 5-minute cache write price.
# Source: https://platform.claude.com/docs/en/about-claude/pricing, checked 2026-11-03
# Longest prefix wins, so point releases with their own price need an exact key.
DEFAULT_PRICES: dict[str, ModelPrice] = {
    "claude-fable-5-1": ModelPrice(10.0, 50.0, 12.50, 0.25),
    "claude-fable-5": ModelPrice(10.0, 50.0, 12.50, 1.0),
    "claude-opus-5-5": ModelPrice(4.0, 20.0, 5.0, 0.20),
    "claude-opus-5": ModelPrice(5.0, 25.0, 6.25, 0.50),
    "claude-sonnet-5-5": ModelPrice(2.0, 10.0, 2.50, 0.10),
    "claude-sonnet-5": ModelPrice(2.0, 10.0, 2.50, 0.20),
    # ponytail: Haiku 5.5 has a >100K-prompt tier (5x); priced at the <=100K tier, so long
    # prompts are underestimated. Upgrade: price per record by prompt size in UsageService.
    "claude-haiku-5": ModelPrice(0.10, 0.50, 0.125, 0.01),
    "claude-opus-4-8": ModelPrice(5.0, 25.0, 6.25, 0.50),
    "claude-opus-4-7": ModelPrice(5.0, 25.0, 6.25, 0.50),
    "claude-opus-4-6": ModelPrice(5.0, 25.0, 6.25, 0.50),
    "claude-opus-4-5": ModelPrice(5.0, 25.0, 6.25, 0.50),
    "claude-opus-4": ModelPrice(15.0, 75.0, 18.75, 1.50),  # 4 and 4.1
    "claude-sonnet-4": ModelPrice(3.0, 15.0, 3.75, 0.30),  # 4, 4.5, 4.6
    "claude-haiku-4": ModelPrice(1.0, 5.0, 1.25, 0.10),
    "claude-3-5-haiku": ModelPrice(0.80, 4.0, 1.0, 0.08),
    # unverified (not on the pricing page any more)
    "claude-3-7-sonnet": ModelPrice(3.0, 15.0, 3.75, 0.30),
    "claude-3-5-sonnet": ModelPrice(3.0, 15.0, 3.75, 0.30),
    "claude-3-haiku": ModelPrice(0.25, 1.25, 0.30, 0.03),
}

PER_MILLION = 1_000_000


class PricingCatalog:
    def __init__(self, prices: dict[str, ModelPrice] | None = None) -> None:
        self._prices = dict(DEFAULT_PRICES if prices is None else prices)

    def price_for(self, model: str) -> ModelPrice | None:
        matches = [prefix for prefix in self._prices if model.startswith(prefix)]
        return self._prices[max(matches, key=len)] if matches else None

    def cost(
        self,
        model: str,
        *,
        input_tokens: int,
        output_tokens: int,
        cache_read: int,
        cache_write: int,
    ) -> float | None:
        price = self.price_for(model)
        if price is None:
            return None
        return (
            input_tokens * price.input
            + output_tokens * price.output
            + cache_read * price.cache_read
            + cache_write * price.cache_write
        ) / PER_MILLION
