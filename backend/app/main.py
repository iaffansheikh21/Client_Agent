from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.db.database import create_tables
from app.api.routes import agent, clients, conversations, webhook, tasks
from app.api.routes import settings as settings_router

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_tables()
    print(f"✅ {settings.app_name} started — DB tables ready")
    yield
    print("👋 Shutting down")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI Agent backend",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agent.router)
app.include_router(clients.router)
app.include_router(conversations.router)
app.include_router(webhook.router)
app.include_router(tasks.router)
app.include_router(settings_router.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}