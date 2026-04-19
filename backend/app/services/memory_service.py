from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.db.models import Conversation, Message, Client, MessageRole, ChannelType, ConversationStatus
from app.db.models import gen_uuid


async def get_or_create_client(
    db: AsyncSession,
    *,
    client_id: str | None = None,
    phone: str | None = None,
    slack_user_id: str | None = None,
    name: str = "Unknown",
    email: str | None = None,
) -> Client:
    """Find existing client by id/phone/slack, or create new one."""

    # Try by explicit ID
    if client_id:
        result = await db.execute(select(Client).where(Client.id == client_id))
        client = result.scalar_one_or_none()
        if client:
            return client

    # Try by phone
    if phone:
        result = await db.execute(select(Client).where(Client.phone == phone))
        client = result.scalar_one_or_none()
        if client:
            return client

    # Try by slack
    if slack_user_id:
        result = await db.execute(select(Client).where(Client.slack_user_id == slack_user_id))
        client = result.scalar_one_or_none()
        if client:
            return client

    # Create new client
    client = Client(
        id=gen_uuid(),
        name=name,
        phone=phone,
        slack_user_id=slack_user_id,
        email=email,
    )
    db.add(client)
    await db.flush()
    return client


async def get_or_create_conversation(
    db: AsyncSession,
    client_id: str,
    channel: str,
) -> Conversation:
    """Get active conversation or create new one for this client+channel."""

    result = await db.execute(
        select(Conversation).where(
            Conversation.client_id == client_id,
            Conversation.channel == channel,
            Conversation.status == ConversationStatus.active,
        ).order_by(Conversation.created_at.desc())
    )
    conversation = result.scalar_one_or_none()

    if not conversation:
        conversation = Conversation(
            id=gen_uuid(),
            client_id=client_id,
            channel=ChannelType(channel),
            status=ConversationStatus.active,
        )
        db.add(conversation)
        await db.flush()

    return conversation


async def get_history(
    db: AsyncSession,
    conversation_id: str,
    limit: int = 20,
) -> list[dict]:
    """Load last N messages as Claude-format dicts."""

    result = await db.execute(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at.desc())
        .limit(limit)
    )
    messages = result.scalars().all()

    return [
        {"role": msg.role.value, "content": msg.content}
        for msg in reversed(messages)
        if msg.role != MessageRole.system
    ]


def build_conversation_state(history: list[dict], client) -> dict:
    """Derive conversation state from history + client record."""
    import re

    has_greeted = len(history) > 0
    client_name = client.name if client.name not in ["Unknown", "Client", "", None] else None
    client_email = client.email

    # Scan history for name/email if not in DB yet
    if not client_name or not client_email:
        for msg in history:
            if msg["role"] == "user":
                if not client_email:
                    m = re.search(r'\b[\w.+-]+@[\w-]+\.[\w.]+\b', msg["content"])
                    if m:
                        client_email = m.group()
                if not client_name:
                    m = re.search(
                        r"(?:my name is|i am|i'm|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)",
                        msg["content"], re.IGNORECASE
                    )
                    if m:
                        client_name = m.group(1).title()

    # Check if last assistant message was asking for confirmation on a task
    awaiting_task_confirmation = False
    if history:
        last_assistant = next(
            (m["content"] for m in reversed(history) if m["role"] == "assistant"), ""
        )
        confirmation_signals = ["shall i proceed", "should i create", "want me to create", "confirm", "go ahead"]
        if any(s in last_assistant.lower() for s in confirmation_signals):
            awaiting_task_confirmation = True

    return {
        "has_greeted": has_greeted,
        "client_name": client_name,
        "client_email": client_email,
        "collected_name": client_name is not None,
        "collected_email": client_email is not None,
        "awaiting_task_confirmation": awaiting_task_confirmation,
    }


async def save_messages(
    db: AsyncSession,
    conversation_id: str,
    user_message: str,
    assistant_reply: str,
):
    """Persist user + assistant messages."""

    db.add(Message(
        id=gen_uuid(),
        conversation_id=conversation_id,
        role=MessageRole.user,
        content=user_message,
    ))
    db.add(Message(
        id=gen_uuid(),
        conversation_id=conversation_id,
        role=MessageRole.assistant,
        content=assistant_reply,
    ))
    await db.flush()
