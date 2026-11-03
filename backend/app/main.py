import asyncio
import contextlib
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.controllers import connection_controller, health_controller, usage_controller
from app.core.config import Settings, get_settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.dependencies import build_container


def create_app(settings: Settings | None = None) -> FastAPI:
    resolved = settings or get_settings()
    configure_logging(resolved.log_level)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        container = build_container(resolved)
        container.database.migrate()
        application.state.container = container
        task = asyncio.create_task(container.sync_service.run_forever(resolved.sync_interval_s))
        try:
            yield
        finally:
            task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await task

    application = FastAPI(title="ai-cost", lifespan=lifespan)
    register_exception_handlers(application)
    application.include_router(health_controller.router)
    application.include_router(connection_controller.router)
    application.include_router(usage_controller.router)
    return application


app = create_app()
