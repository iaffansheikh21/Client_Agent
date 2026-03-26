from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.schemas import IncomingMessage, AgentResponse
from app.services import ai_service, memory_service

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/chat", response_model=AgentResponse)
async def chat(payload: IncomingMessage, db: AsyncSession = Depends(get_db)):
    """
    Main endpoint. Called by n8n (or directly) with a client message.
    Returns AI reply + any action to perform (create task, invoice, escalate).
    """

    # 1. Resolve or create client
    client = await memory_service.get_or_create_client(
        db,
        client_id=payload.client_id,
        phone=payload.sender_phone,
        slack_user_id=payload.sender_slack_id,
        name=payload.sender_name or "Client",
    )

    # 2. Get or create active conversation
    conversation = await memory_service.get_or_create_conversation(
        db,
        client_id=client.id,
        channel=payload.channel,
    )

    # 3. Load conversation history
    history = await memory_service.get_history(db, conversation.id)

    # 4. Run AI agent
    reply, action, tokens = await ai_service.process_message(
        message=payload.message,
        conversation_history=history,
    )

    # 5. Save messages to DB
    await memory_service.save_messages(
        db,
        conversation_id=conversation.id,
        user_message=payload.message,
        assistant_reply=reply,
    )

    return AgentResponse(
        reply=reply,
        client_id=client.id,
        conversation_id=conversation.id,
        action=action,
        tokens_used=tokens,
    )
