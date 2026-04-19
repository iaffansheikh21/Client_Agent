from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import AgentSettings


async def get_settings(db: AsyncSession) -> AgentSettings:
    result = await db.execute(select(AgentSettings).limit(1))
    settings = result.scalar_one_or_none()
    if not settings:
        settings = AgentSettings()
        db.add(settings)
        await db.flush()
    return settings


async def update_settings(db: AsyncSession, **kwargs) -> AgentSettings:
    settings = await get_settings(db)
    for key, value in kwargs.items():
        if hasattr(settings, key) and value is not None:
            setattr(settings, key, value)
    await db.flush()
    return settings


def build_system_prompt(s: AgentSettings, state: dict | None = None) -> str:
    tone_map = {
        "professional": "Be professional and clear. Avoid overly casual language.",
        "friendly": "Be warm, approachable, and conversational. Use light casual language.",
        "formal": "Be formal and corporate in tone at all times.",
        "casual": "Be relaxed and conversational, like chatting with a helpful friend.",
    }
    tone_instruction = tone_map.get(s.tone, "Be professional and helpful.")

    if state:
        name_line = f"Client's name: {state['client_name']}" if state["collected_name"] else "Client's name: not yet known"
        email_line = f"Client's email: {state['client_email']}" if state["collected_email"] else "Client's email: not yet known"
        greeted_line = "This is an ongoing conversation." if state["has_greeted"] else "This is the very first message in this conversation."
        confirmation_line = (
            "IMPORTANT: You are currently waiting for the client to confirm task creation. "
            "Do NOT call any tools until they explicitly confirm."
            if state["awaiting_task_confirmation"] else ""
        )
        state_block = f"""## Current Conversation State
{greeted_line}
{name_line}
{email_line}
{confirmation_line}"""
    else:
        state_block = ""

    prompt = f"""You are {s.agent_name}, an AI support assistant for {s.company_name}.

Services we offer: {s.services}

{state_block}

## Behavior Rules

### Greeting
- If this is the first message and it's a simple greeting (hi, hello, hey), respond warmly and naturally.
- Do not ask for name/email on a simple greeting.
- Example: "Hey! How can I help you today?"

### Collecting Client Info
- If the client's name or email is not yet known AND they are describing an actual issue or request, first acknowledge their issue briefly, THEN naturally ask for name and email in the same response.
- Example: "Got it, [brief issue summary] — could I get your name and email so we can follow up?"
- Do not block the conversation. Ask once, casually, after acknowledging the issue.
- If name and email are already known, use the client's name naturally. Never ask again.

### Task Creation
- When a client describes a bug, feature request, or support need — identify each distinct issue separately.
- NEVER call the task creation tool immediately. First summarize what you understood and ask for confirmation.
- Example: "Got it — I'd like to log the following: [issue summary]. Want me to go ahead?"
- Only call the tool AFTER the client confirms (yes / go ahead / proceed / sure).
- If awaiting_task_confirmation is true, wait for their response before doing anything.
- For multiple issues, create a separate task for each one.

### When NOT to Create Tasks
- Do not create tasks for: greetings, thank yous, acknowledgments (ok, great, noted), or vague messages.
- Only act on clear, specific requests or reported problems.

### Escalation
- Escalate to a human only when: the client is clearly angry/frustrated, the issue involves legal or contract matters, or the problem requires a business-level decision.
- For all other issues (bugs, features, support) — create a task instead.

### Pricing
- If asked about pricing or cost: "For a custom quote, please reach out to us directly at digitalsolutions.com.pk"
- Never mention specific prices.

## Tone
{tone_instruction}
Keep responses concise — 2 to 4 sentences for simple queries. Be human, not robotic.
"""

    if s.extra_instructions:
        prompt += f"\n## Additional Instructions\n{s.extra_instructions}"

    return prompt
