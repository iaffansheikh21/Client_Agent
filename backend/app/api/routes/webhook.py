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

    reply, action, _, *_ = await ai_service.process_message(
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
                client_id=client.id,
                db=db,
            )
        except Exception as e:
            print(f"ERROR Trello: {e}")
    if action.type == "escalate":
        try:
            async with httpx.AsyncClient() as alert_client:
                await alert_client.post(
                    "https://slack.com/api/chat.postMessage",
                    headers={
                        "Authorization": f"Bearer {settings.slack_bot_token}",
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    json={
                        "channel": settings.slack_alert_channel,
                        "text": f":rotating_light: *Human Escalation Required*\n\n*Client:* {sender_name} ({sender_phone})\n*Channel:* WhatsApp\n*Reason:* {action.payload.get('reason', 'Not specified')}\n*Urgency:* {action.payload.get('urgency', 'low').upper()}\n\n*Client Message:*\n>{message_text}\n\n_Please respond to the client on WhatsApp._"
                    },
                )
                print(f"✅ Escalation alert sent to #agent-alerts")
                #Email Notification
                from app.services import email_service
                await email_service.send_escalation_email(
                    client_name=sender_name,
                    client_contact=sender_phone,
                    channel="WhatsApp",
                    reason=action.payload.get("reason", "Not specified"),
                    urgency=action.payload.get("urgency", "low"),
                    original_message=message_text,
                )
        except Exception as e:
            print(f"ERROR Escalation alert: {e}")
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

            reply, action, _, *_ = await ai_service.process_message(
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
                        client_id=client.id,
                        db=db,
                    )
                except Exception as e:
                    print(f"ERROR Trello: {e}")
                # Human escalation alert
            if action.type == "escalate":
                try:
                    async with httpx.AsyncClient() as alert_client:
                        await alert_client.post(
                            "https://slack.com/api/chat.postMessage",
                            headers={
                                "Authorization": f"Bearer {settings.slack_bot_token}",
                                "Content-Type": "application/json; charset=utf-8",
                            },
                            json={
                                "channel": settings.slack_alert_channel,
                                "text": f":rotating_light: *Human Escalation Required*\n\n*Client:* {slack_user_id}\n*Channel:* Slack DM\n*Reason:* {action.payload.get('reason', 'Not specified')}\n*Urgency:* {action.payload.get('urgency', 'low').upper()}\n\n*Client Message:*\n>{message_text}\n\n_Please respond to the client directly._"
                            },
                        )
                        print(f"✅ Escalation alert sent to #agent-alerts")
                        #Email Notification
                        from app.services import email_service
                    await email_service.send_escalation_email(
                    client_name=f"Slack User {slack_user_id}",
                    client_contact=slack_user_id,
                    channel="Slack",
                    reason=action.payload.get("reason", "Not specified"),
                    urgency=action.payload.get("urgency", "low"),
                    original_message=message_text,
                )
                except Exception as e:
                    print(f"ERROR Escalation alert: {e}")    
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

@router.head("/trello")
async def trello_webhook_verify():
    """Trello sends HEAD request to verify webhook URL."""
    return Response(status_code=200)
@router.post("/trello")
async def trello_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    """Receive Trello card update events."""
    
    # Trello sends HEAD request first for verification
    if request.method == "HEAD":
        return Response(status_code=200)
    
    try:
        data = await request.json()
    except:
        return {"ok": True}

    action = data.get("action", {})
    action_type = action.get("type", "")
    
    # Only handle card moves (updateCard with listAfter)
    if action_type != "updateCard":
        return {"ok": True}
    
    action_data = action.get("data", {})
    list_after = action_data.get("listAfter", {})
    
    if not list_after:
        return {"ok": True}

    card = action_data.get("card", {})
    card_name = card.get("name", "")
    new_list = list_after.get("name", "")
    
    print(f"DEBUG Trello: Card '{card_name}' moved to '{new_list}'")

    # Find client from DB by matching recent task messages
    # Search in messages for this card title
    from sqlalchemy import select, or_
    from app.db.models import Message, Conversation, Client
    
    result = await db.execute(
        select(Message).where(
            Message.role == "assistant",
            Message.content.ilike(f"%{card_name[:30]}%")
        ).order_by(Message.created_at.desc()).limit(5)
    )
    messages = result.scalars().all()
    
    client = None
    for msg in messages:
        conv_result = await db.execute(
            select(Conversation).where(Conversation.id == msg.conversation_id)
        )
        conv = conv_result.scalar_one_or_none()
        if conv:
            client_result = await db.execute(
                select(Client).where(Client.id == conv.client_id)
            )
            client = client_result.scalar_one_or_none()
            if client:
                break

    if not client:
        print(f"DEBUG: No client found for card '{card_name}'")
        return {"ok": True}

    # Build notification message
    status_emoji = {
        "ToDo": "📋",
        "In Progress": "⚙️",
        "In Review": "🔍",
        "Done": "✅",
    }
    emoji = status_emoji.get(new_list, "📌")
    
    notification = f"{emoji} Update on your task *{card_name}*: Status changed to *{new_list}*."
    
    if new_list == "Done":
        notification += " Your issue has been resolved! Please let us know if you need anything else."
    elif new_list == "In Progress":
        notification += " Our team is actively working on it."
    elif new_list == "In Review":
        notification += " Our team has completed the work and it's under review."

    # Send via WhatsApp if phone exists
    if client.phone:
        try:
            from app.config import get_settings as _get_settings
            _settings = _get_settings()
            import httpx
            async with httpx.AsyncClient() as http_client:
                await http_client.post(
                    "https://api.twilio.com/2010-04-01/Accounts/"
                    f"{_settings.twilio_account_sid}/Messages.json",
                    auth=(_settings.twilio_account_sid, _settings.twilio_auth_token),
                    data={
                        "From": f"whatsapp:{_settings.twilio_whatsapp_number}",
                        "To": f"whatsapp:{client.phone}",
                        "Body": notification,
                    },
                )
                print(f"✅ WhatsApp notification sent to {client.phone}")
        except Exception as e:
            print(f"ERROR WhatsApp notify: {e}")

    # Send via Slack if slack_user_id exists
    if client.slack_user_id:
        try:
            from app.config import get_settings as _get_settings
            _settings = _get_settings()
            import httpx
            async with httpx.AsyncClient() as http_client:
                # Open DM channel
                dm_res = await http_client.post(
                    "https://slack.com/api/conversations.open",
                    headers={
                        "Authorization": f"Bearer {_settings.slack_bot_token}",
                        "Content-Type": "application/json; charset=utf-8",
                    },
                    json={"users": client.slack_user_id},
                )
                dm_data = dm_res.json()
                dm_channel = dm_data.get("channel", {}).get("id")
                
                if dm_channel:
                    await http_client.post(
                        "https://slack.com/api/chat.postMessage",
                        headers={
                            "Authorization": f"Bearer {_settings.slack_bot_token}",
                            "Content-Type": "application/json; charset=utf-8",
                        },
                        json={"channel": dm_channel, "text": notification},
                    )
                    print(f"✅ Slack notification sent to {client.slack_user_id}")
        except Exception as e:
            print(f"ERROR Slack notify: {e}")

    # Send email if email exists
    if client.email:
        try:
            from app.services.email_service import send_task_status_email
            await send_task_status_email(
                client_name=client.name,
                client_email=client.email,
                task_title=card_name,
                new_status=new_list,
                notification_text=notification,
            )
        except Exception as e:
            print(f"ERROR Email notify: {e}")

    return {"ok": True}