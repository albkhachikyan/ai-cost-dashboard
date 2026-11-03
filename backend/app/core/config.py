from functools import lru_cache
from pathlib import Path
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Runtime configuration, read from environment variables."""

    model_config = SettingsConfigDict(extra="ignore", populate_by_name=True)

    claude_projects_dir: Path = Field(default=Path("/claude/projects"), alias="CLAUDE_PROJECTS_DIR")
    db_path: Path = Field(default=Path("/data/usage.db"), alias="DB_PATH")
    sync_interval_s: int = Field(default=60, ge=10, le=3600, alias="SYNC_INTERVAL_S")
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR"] = Field(
        default="INFO", alias="LOG_LEVEL"
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()
