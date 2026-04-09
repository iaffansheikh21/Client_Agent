from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel
from app.db.database import get_db
from app.services import settings_service

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingsUpdate(BaseModel):
    agent_name: str | None = None
    company_name: str | None = None
    services: str | None = None
    tone: str | None = None
    extra_instructions: str | None = None


@router.get("/")
async def get_settings(db: AsyncSession = Depends(get_db)):
    s = await settings_service.get_settings(db)
    return {
        "agent_name": s.agent_name,
        "company_name": s.company_name,
        "services": s.services,
        "tone": s.tone,
        "extra_instructions": s.extra_instructions,
        "system_prompt": settings_service.build_system_prompt(s),
        "updated_at": str(s.updated_at),
    }


@router.patch("/")
async def update_settings(payload: SettingsUpdate, db: AsyncSession = Depends(get_db)):
    s = await settings_service.update_settings(db, **payload.model_dump(exclude_none=True))
    await db.refresh(s)
    return {
        "agent_name": s.agent_name,
        "company_name": s.company_name,
        "services": s.services,
        "tone": s.tone,
        "extra_instructions": s.extra_instructions,
        "system_prompt": settings_service.build_system_prompt(s),
        "updated_at": str(s.updated_at),
    }