from dataclasses import dataclass
from typing import cast

from fastapi import Request

from app.core.config import Settings
from app.core.database import Database
from app.repositories.sync_state_repository import SyncStateRepository
from app.repositories.usage_repository import UsageRepository
from app.services.pricing_service import PricingCatalog
from app.services.sync_service import SyncService
from app.services.transcript_parser import ClaudeCodeTranscriptParser
from app.services.usage_service import UsageService


@dataclass(frozen=True, slots=True)
class Container:
    settings: Settings
    database: Database
    sync_service: SyncService
    usage_service: UsageService


def build_container(settings: Settings) -> Container:
    """The only place the object graph is wired."""
    database = Database(settings.db_path)
    usage_repo = UsageRepository(database)
    state_repo = SyncStateRepository(database)
    parser = ClaudeCodeTranscriptParser(settings.claude_projects_dir)
    return Container(
        settings=settings,
        database=database,
        sync_service=SyncService(settings.claude_projects_dir, parser, usage_repo, state_repo),
        usage_service=UsageService(usage_repo, PricingCatalog()),
    )


def _container(request: Request) -> Container:
    return cast("Container", request.app.state.container)


def get_database(request: Request) -> Database:
    return _container(request).database


def get_sync_service(request: Request) -> SyncService:
    return _container(request).sync_service


def get_usage_service(request: Request) -> UsageService:
    return _container(request).usage_service
