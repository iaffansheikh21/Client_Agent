from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import AgentSettings


async def get_settings(db: AsyncSession) -> AgentSettings:
    """Get current agent settings — create default if not exists."""
    result = await db.execute(select(AgentSettings).limit(1))
    settings = result.scalar_one_or_none()

    if not settings:
        settings = AgentSettings()
        db.add(settings)
        await db.flush()

    return settings


async def update_settings(db: AsyncSession, **kwargs) -> AgentSettings:
    """Update agent settings."""
    settings = await get_settings(db)
    for key, value in kwargs.items():
        if hasattr(settings, key) and value is not None:
            setattr(settings, key, value)
    await db.flush()
    return settings


def build_system_prompt(s: AgentSettings) -> str:
    """Build system prompt from settings."""
    tone_map = {
        "professional": "Be professional and formal in all responses.",
        "friendly": "Be warm, friendly, and approachable. Use casual language.",
        "formal": "Be very formal and corporate in tone.",
        "casual": "Be casual and conversational, like chatting with a friend.",
    }

    tone_instruction = tone_map.get(s.tone, "Be professional and helpful.")

    prompt = f"""You are {s.agent_name}, a professional AI assistant for {s.company_name}.

Our services include: {s.services}

Your responsibilities:
1. Answer client queries about our services professionally and helpfully
2. Create Trello tasks when a client reports a bug, requests a feature, or needs support work done
3. Generate invoices when a client asks about billing or payment
4. Escalate to a human agent when: the issue is complex, the client is angry, or you are not confident

Tone & Style:
{tone_instruction}
Keep responses concise (2-4 sentences max for simple queries).
Always confirm before creating tasks or invoices.
"""

    if s.extra_instructions:
        prompt += f"\nAdditional Instructions:\n{s.extra_instructions}"

    return prompt