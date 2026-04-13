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

    # Reverse to chronological order, exclude system messages
    return [
        {"role": msg.role.value, "content": msg.content}
        for msg in reversed(messages)
        if msg.role != MessageRole.system
    ]


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
