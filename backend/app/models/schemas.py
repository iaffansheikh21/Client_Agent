from pydantic import BaseModel
from datetime import datetime
from typing import Literal


# ── Incoming message from n8n / direct API ───────────────────────────────────

class IncomingMessage(BaseModel):
    client_id: str | None = None          # None = new client, will be created
    channel: Literal["whatsapp", "slack", "email", "api"] = "api"
    message: str
    sender_name: str | None = None        # e.g. "Ahmed" from WhatsApp profile
    sender_phone: str | None = None       # WhatsApp number
    sender_slack_id: str | None = None    # Slack user ID


# ── Agent response back to n8n ────────────────────────────────────────────────

class AgentAction(BaseModel):
    type: Literal["create_task", "send_invoice", "escalate", "none"]
    payload: dict = {}


class AgentResponse(BaseModel):
    reply: str
    client_id: str
    conversation_id: str
    action: AgentAction
    tokens_used: int = 0


# ── Client schemas ────────────────────────────────────────────────────────────

class ClientCreate(BaseModel):
    name: str
    phone: str | None = None
    slack_user_id: str | None = None
    email: str | None = None
    company: str | None = None


class ClientOut(BaseModel):
    id: str
    name: str
    phone: str | None
    slack_user_id: str | None
    email: str | None
    company: str | None
    created_at: datetime

    class Config:
        from_attributes = True


# ── Conversation schemas ──────────────────────────────────────────────────────

class MessageOut(BaseModel):
    id: str
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


class ConversationOut(BaseModel):
    id: str
    client_id: str
    channel: str
    status: str
    created_at: datetime
    messages: list[MessageOut] = []

    class Config:
        from_attributes = True
