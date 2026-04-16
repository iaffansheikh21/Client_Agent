from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.services import trello_service
from app.db.database import get_db
from app.db.models import TrelloCard, Client
from app.config import get_settings
import httpx

router = APIRouter(prefix="/tasks", tags=["tasks"])
settings = get_settings()


@router.get("/")
async def get_tasks():
    try:
        cards = await trello_service.get_board_cards()
        return cards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{card_id}/status")
async def update_task_status(card_id: str, list_name: str, db: AsyncSession = Depends(get_db)):
    try:
        result = await trello_service.update_card_status(card_id, list_name)

        # Find client linked to this card
        card_result = await db.execute(
            select(TrelloCard).where(TrelloCard.card_id == card_id)
        )
        trello_card = card_result.scalar_one_or_none()

        if trello_card:
            client_result = await db.execute(
                select(Client).where(Client.id == trello_card.client_id)
            )
            client = client_result.scalar_one_or_none()

            if client:
                msg = f"Hi {client.name}! Your task *{trello_card.title}* has been moved to *{list_name}*. 🔔"

                # WhatsApp notification
                if client.phone:
                    try:
                        from twilio.rest import Client as TwilioClient
                        twilio = TwilioClient(settings.twilio_account_sid, settings.twilio_auth_token)
                        twilio.messages.create(
                            from_=f"whatsapp:{settings.twilio_whatsapp_number}",
                            to=f"whatsapp:{client.phone}",
                            body=msg,
                        )
                        print(f"✅ WhatsApp notification sent to {client.phone}")
                    except Exception as e:
                        print(f"ERROR WhatsApp notify: {e}")

                # Slack notification
                if client.slack_user_id:
                    try:
                        async with httpx.AsyncClient() as http_client:
                            await http_client.post(
                                "https://slack.com/api/chat.postMessage",
                                headers={"Authorization": f"Bearer {settings.slack_bot_token}", "Content-Type": "application/json"},
                                json={"channel": client.slack_user_id, "text": msg},
                            )
                        print(f"✅ Slack notification sent to {client.slack_user_id}")
                    except Exception as e:
                        print(f"ERROR Slack notify: {e}")

                # Email notification
                if client.email:
                    try:
                        from app.services import email_service
                        await email_service.send_task_status_email(
                            client_name=client.name,
                            client_email=client.email,
                            task_title=trello_card.title,
                            new_status=list_name,
                            notification_text=f"Your task has been moved to {list_name}",
                        )
                    except Exception as e:
                        print(f"ERROR Email notify: {e}")

        return result

    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
