from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, cast, Date
from datetime import datetime, timedelta
from app.db.database import get_db
from app.db.models import Message, Conversation, Client, MessageRole

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/")
async def get_analytics(db: AsyncSession = Depends(get_db)):

    # ── Total counts ─────────────────────────────────────────────────────────
    total_conversations = await db.scalar(select(func.count(Conversation.id)))
    total_clients = await db.scalar(select(func.count(Client.id)))
    total_messages = await db.scalar(select(func.count(Message.id)))

    # ── Escalation count ─────────────────────────────────────────────────────
    escalated = await db.scalar(
        select(func.count(Conversation.id)).where(Conversation.status == "escalated")
    )
    escalation_rate = round((escalated / total_conversations * 100), 1) if total_conversations else 0

    # ── Channel breakdown ─────────────────────────────────────────────────────
    channel_result = await db.execute(
        select(Conversation.channel, func.count(Conversation.id))
        .group_by(Conversation.channel)
    )
    channel_data = [
        {"channel": str(row[0].value if hasattr(row[0], 'value') else row[0]), "count": row[1]}
        for row in channel_result.all()
    ]

    # ── Messages per day (last 14 days) ───────────────────────────────────────
    fourteen_days_ago = datetime.utcnow() - timedelta(days=14)
    msg_per_day_result = await db.execute(
        select(
            cast(Message.created_at, Date).label("date"),
            func.count(Message.id).label("count")
        )
        .where(Message.created_at >= fourteen_days_ago)
        .where(Message.role == MessageRole.user)
        .group_by(cast(Message.created_at, Date))
        .order_by(cast(Message.created_at, Date))
    )
    msg_per_day = [
        {"date": str(row.date), "count": row.count}
        for row in msg_per_day_result.all()
    ]

    # Fill missing days with 0
    date_map = {item["date"]: item["count"] for item in msg_per_day}
    full_msg_per_day = []
    for i in range(14):
        d = (datetime.utcnow() - timedelta(days=13-i)).strftime("%Y-%m-%d")
        full_msg_per_day.append({"date": d, "count": date_map.get(d, 0)})

    # ── Tasks per day (last 14 days) ─────────────────────────────────────────
    task_per_day_result = await db.execute(
        select(
            cast(Message.created_at, Date).label("date"),
            func.count(Message.id).label("count")
        )
        .where(Message.created_at >= fourteen_days_ago)
        .where(Message.role == MessageRole.assistant)
        .where(Message.content.ilike("%created a support task%"))
        .group_by(cast(Message.created_at, Date))
        .order_by(cast(Message.created_at, Date))
    )
    task_per_day = [{"date": str(row.date), "count": row.count} for row in task_per_day_result.all()]
    task_date_map = {item["date"]: item["count"] for item in task_per_day}
    full_task_per_day = []
    for i in range(14):
        d = (datetime.utcnow() - timedelta(days=13-i)).strftime("%Y-%m-%d")
        full_task_per_day.append({"date": d, "count": task_date_map.get(d, 0)})

    # ── Conversations per day (last 14 days) ─────────────────────────────────
    conv_per_day_result = await db.execute(
        select(
            cast(Conversation.created_at, Date).label("date"),
            func.count(Conversation.id).label("count")
        )
        .where(Conversation.created_at >= fourteen_days_ago)
        .group_by(cast(Conversation.created_at, Date))
        .order_by(cast(Conversation.created_at, Date))
    )
    conv_date_map = {str(row.date): row.count for row in conv_per_day_result.all()}
    full_conv_per_day = []
    for i in range(14):
        d = (datetime.utcnow() - timedelta(days=13-i)).strftime("%Y-%m-%d")
        full_conv_per_day.append({"date": d, "count": conv_date_map.get(d, 0)})

    return {
        "totals": {
            "conversations": total_conversations,
            "clients": total_clients,
            "messages": total_messages,
            "escalated": escalated,
            "escalation_rate": escalation_rate,
        },
        "channel_breakdown": channel_data,
        "messages_per_day": full_msg_per_day,
        "tasks_per_day": full_task_per_day,
        "conversations_per_day": full_conv_per_day,
    }