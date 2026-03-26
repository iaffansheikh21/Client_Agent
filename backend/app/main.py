from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import get_settings
from app.db.database import create_tables
from app.api.routes import agent, clients, conversations, webhook

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: create DB tables
    await create_tables()
    print(f"✅ {settings.app_name} started — DB tables ready")
    yield
    # Shutdown
    print("👋 Shutting down")


app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    description="AI Agent backend — Week 1",
    lifespan=lifespan,
)

# ── CORS (allow Next.js dev server) ──────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(agent.router)
app.include_router(clients.router)
app.include_router(conversations.router)
app.include_router(webhook.router)


@app.get("/health")
async def health():
    return {"status": "ok", "service": settings.app_name}
