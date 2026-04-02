from fastapi import APIRouter, Request, Depends, BackgroundTasks
from fastapi.responses import Response
import httpx

from app.config import get_settings
from app.services import ai_service, memory_service
from app.db.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/webhook", tags=["webhooks"])
settings = get_settings()

# ------------------ WHATSAPP ------------------ #
@router.post("/whatsapp")
async def whatsapp_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    form_data = await request.form()

    sender_phone = form_data.get("From", "").replace("whatsapp:", "")
    message_text = form_data.get("Body", "").strip()
    sender_name  = form_data.get("ProfileName", "Client")

    if not message_text:
        return Response(content="", media_type="text/plain")

    client = await memory_service.get_or_create_client(db, phone=sender_phone, name=sender_name)
    conversation = await memory_service.get_or_create_conversation(db, client_id=client.id, channel="whatsapp")
    history = await memory_service.get_history(db, conversation.id)

    reply, action, _ = await ai_service.process_message(
        message=message_text,
        conversation_history=history
    )

    await memory_service.save_messages(
        db,
        conversation_id=conversation.id,
        user_message=message_text,
        assistant_reply=reply
    )

    # Trello Task
    if action.type == "create_task":
        from app.services import trello_service
        try:
            await trello_service.create_card(
                title=action.payload.get("title", "New Task"),
                description=action.payload.get("description", ""),
                priority=action.payload.get("priority", "medium"),
                task_type=action.payload.get("task_type", "support"),
            )
        except Exception as e:
            print(f"ERROR Trello: {e}")

    if not reply or not reply.strip():
        reply = "Hello! How can I assist you today?"

    return Response(content=reply, media_type="text/plain")


# ------------------ SLACK ------------------ #
processed_events: set = set()


async def handle_slack_message(slack_user_id: str, message_text: str, channel_id: str, thread_ts: str | None):
    from app.db.database import AsyncSessionLocal

    async with AsyncSessionLocal() as db:
        try:
            client = await memory_service.get_or_create_client(
                db,
                slack_user_id=slack_user_id,
                name=f"Slack User {slack_user_id}",
            )

            conversation = await memory_service.get_or_create_conversation(
                db,
                client_id=client.id,
                channel="slack"
            )

            history = await memory_service.get_history(db, conversation.id)

            reply, action, _ = await ai_service.process_message(
                message=message_text,
                conversation_history=history,
            )

            await memory_service.save_messages(
                db,
                conversation_id=conversation.id,
                user_message=message_text,
                assistant_reply=reply,
            )

            # Trello Task
            if action.type == "create_task":
                from app.services import trello_service
                try:
                    await trello_service.create_card(
                        title=action.payload.get("title", "New Task"),
                        description=action.payload.get("description", ""),
                        priority=action.payload.get("priority", "medium"),
                        task_type=action.payload.get("task_type", "support"),
                    )
                except Exception as e:
                    print(f"ERROR Trello: {e}")

            await db.commit()

        except Exception as e:
            await db.rollback()
            print(f"ERROR Slack: {e}")
            reply = "Sorry, I encountered an error. Please try again."

    # 🔥 FIXED PAYLOAD (THREAD CONTROL)
    payload = {
        "channel": channel_id,
        "text": reply,
    }

    # ✅ Only send thread_ts if message was in thread
    if thread_ts:
        payload["thread_ts"] = thread_ts

    async with httpx.AsyncClient() as http_client:
        await http_client.post(
            "https://slack.com/api/chat.postMessage",
            headers={
                "Authorization": f"Bearer {settings.slack_bot_token}",
                "Content-Type": "application/json; charset=utf-8",
            },
            json=payload,
        )


@router.post("/slack")
async def slack_webhook(request: Request, background_tasks: BackgroundTasks):
    data = await request.json()

    # URL verification
    if data.get("type") == "url_verification":
        return {"challenge": data.get("challenge")}

    event = data.get("event", {})
    event_id = data.get("event_id", "")

    # Ignore non-message events
    if (
        event.get("type") != "message"
        or event.get("bot_id")
        or event.get("subtype")
    ):
        return {"ok": True}

    # Duplicate check
    if event_id in processed_events:
        return {"ok": True}

    processed_events.add(event_id)

    if len(processed_events) > 1000:
        processed_events.clear()

    slack_user_id = event.get("user")
    message_text  = event.get("text", "").strip()
    channel_id    = event.get("channel")

    # 🔥 IMPORTANT: thread_ts handling
    thread_ts = event.get("thread_ts")  # only exists if thread

    if not message_text or not slack_user_id:
        return {"ok": True}

    background_tasks.add_task(
        handle_slack_message,
        slack_user_id,
        message_text,
        channel_id,
        thread_ts,  # ✅ pass thread info
    )

    return {"ok": True}