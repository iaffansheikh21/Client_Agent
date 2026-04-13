from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import get_db
from app.models.schemas import IncomingMessage, AgentResponse
from app.services import ai_service, memory_service
from app.config import get_settings
settings = get_settings()


router = APIRouter(prefix="/agent", tags=["agent"])

@router.post("/chat", response_model=AgentResponse)
async def chat(payload: IncomingMessage, db: AsyncSession = Depends(get_db)):

    # 1. Resolve or create client
    client = await memory_service.get_or_create_client(
        db,
        client_id=payload.client_id,
        phone=payload.sender_phone,
        slack_user_id=payload.sender_slack_id,
        name=payload.sender_name or "Client",
    )

    # 2. Get or create conversation
    conversation = await memory_service.get_or_create_conversation(
        db, client_id=client.id, channel=payload.channel,
    )

    # 3. Load history
    history = await memory_service.get_history(db, conversation.id)

     # 4. Run AI — now returns (reply, primary_action, tokens, all_actions)
    result = await ai_service.process_message(
        message=payload.message,
        conversation_history=history,
        dry_run=payload.dry_run,
    )
    reply, action, tokens = result[0], result[1], result[2]
    all_actions = result[3] if len(result) > 3 else [action]

    # 5. Extract name/email
    all_messages = history + [{"role": "user", "content": payload.message}]
    client_info = await ai_service.extract_client_info(all_messages)

    if client_info["email"] and not client.email:
        client.email = client_info["email"]
    if client_info["name"] and client.name in ["Unknown", "Client"]:
        client.name = client_info["name"]

    # 6. Save messages
    await memory_service.save_messages(
        db,
        conversation_id=conversation.id,
        user_message=payload.message,
        assistant_reply=reply,
    )

    # 7. Handle ALL actions
    if not payload.dry_run:
        from app.services import trello_service, email_service
        for act in all_actions:
            if act.type == "create_task":
                try:
                    card = await trello_service.create_card(
                        title=act.payload.get("title", "New Task"),
                        description=act.payload.get("description", ""),
                        priority=act.payload.get("priority", "medium"),
                        task_type=act.payload.get("task_type", "support"),
                    )
                    print(f"✅ Trello card: {act.payload.get('title')}")

                    # Email to client
                    if client.email:
                        await email_service.send_task_created_email(
                            client_name=client.name,
                            client_email=settings.alert_email,
                            task_title=act.payload.get("title", "New Task"),
                            task_description=act.payload.get("description", ""),
                            task_priority=act.payload.get("priority", "medium"),
                            trello_url=card.get("url", ""),
                        )
                except Exception as e:
                    print(f"ERROR Trello/Email: {e}")
            elif act.type == "escalate":
                try:
                    import httpx
                    async with httpx.AsyncClient() as http_client:
                        await http_client.post(
                            "https://slack.com/api/chat.postMessage",
                            headers={
                                "Authorization": f"Bearer {settings.slack_bot_token}",
                                "Content-Type": "application/json; charset=utf-8",
                            },
                            json={
                                "channel": settings.slack_alert_channel,
                                "text": f":rotating_light: *Escalation*\n*Client:* {client.name}\n*Reason:* {act.payload.get('reason', '')}",
                            },
                        )
                except Exception as e:
                    print(f"ERROR Escalation: {e}")

    return AgentResponse(
        reply=reply,
        client_id=client.id,
        conversation_id=conversation.id,
        action=action,
        tokens_used=tokens,
    )