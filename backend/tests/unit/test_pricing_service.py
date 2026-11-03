import pytest

from app.domain.entities import ModelPrice
from app.services.pricing_service import PricingCatalog


def test_longest_prefix_wins() -> None:
    catalog = PricingCatalog(
        {"claude-opus-4": ModelPrice(1, 1, 1, 1), "claude-opus-4-5": ModelPrice(2, 2, 2, 2)}
    )
    assert catalog.price_for("claude-opus-4-5-20251101") == ModelPrice(2, 2, 2, 2)
    assert catalog.price_for("claude-opus-4-1") == ModelPrice(1, 1, 1, 1)


def test_unknown_model_is_none() -> None:
    catalog = PricingCatalog()
    assert catalog.price_for("gpt-5") is None
    assert (
        catalog.cost("gpt-5", input_tokens=1, output_tokens=1, cache_read=1, cache_write=1) is None
    )


def test_cost_formula() -> None:
    catalog = PricingCatalog({"m": ModelPrice(1.0, 2.0, 3.0, 4.0)})
    cost = catalog.cost(
        "m", input_tokens=1_000_000, output_tokens=1_000_000, cache_read=1_000_000, cache_write=0
    )
    assert cost == pytest.approx(7.0)


def test_default_catalog_knows_families() -> None:
    catalog = PricingCatalog()
    for model in ("claude-opus-5-5", "claude-sonnet-4-5", "claude-3-5-haiku-20241022"):
        assert catalog.price_for(model) is not None


def test_point_release_prices_beat_family_prefix() -> None:
    catalog = PricingCatalog()
    opus55 = catalog.price_for("claude-opus-5-5")
    opus46 = catalog.price_for("claude-opus-4-6-20260101")
    assert opus55 is not None
    assert opus46 is not None
    assert (opus55.input, opus55.output) == (4.0, 20.0)
    assert opus46.input == 5.0  # not the legacy Opus 4 $15 rate
