from openai import AsyncOpenAI
from app.config import get_settings
from app.models.schemas import AgentAction
import json
import re
import random

settings = get_settings()
client = AsyncOpenAI(api_key=settings.openai_api_key)

TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_jira_task",
            "description": "Create a Trello task when client reports a bug, requests a feature, or needs support work. Call this tool ONCE PER ISSUE. If there are multiple issues, call this tool multiple times with different titles.",
            "parameters": {
                "type": "object",
                "properties": {
                    "title": {"type": "string"},
                    "description": {"type": "string"},
                    "priority": {"type": "string", "enum": ["low", "medium", "high", "critical"]},
                    "task_type": {"type": "string", "enum": ["bug", "feature", "support", "question"]}
                },
                "required": ["title", "description", "priority", "task_type"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_invoice",
            "description": "Generate invoice when client asks about billing or payment.",
            "parameters": {
                "type": "object",
                "properties": {
                    "description": {"type": "string"},
                    "amount": {"type": "number"}
                },
                "required": ["description", "amount"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "escalate_to_human",
            "description": "Escalate to human agent when issue is complex or client is frustrated.",
            "parameters": {
                "type": "object",
                "properties": {
                    "reason": {"type": "string"},
                    "urgency": {"type": "string", "enum": ["low", "high"]}
                },
                "required": ["reason"]
            }
        }
    }
]

IGNORE_PATTERNS = [
    "thank you", "thanks", "ok", "okay", "great", "got it",
    "sounds good", "perfect", "awesome", "noted", "sure",
    "alright", "cool", "nice", "good", "appreciated",
    "thx", "ty", "tnx", "👍", "great job", "well done",
]

POLITE_REPLIES = [
    "You're welcome! Is there anything else I can help you with?",
    "Happy to help! Let me know if you need anything else.",
    "Glad I could assist! Feel free to reach out anytime.",
    "Of course! Don't hesitate to contact us if you need further assistance.",
]


def is_casual_message(message: str) -> bool:
    msg = message.lower().strip().rstrip("!.?")
    for pattern in IGNORE_PATTERNS:
        if msg == pattern:
            return True
        if msg.startswith(pattern + " ") or msg.startswith(pattern + ","):
            return True
    return False


async def process_message(
    message: str,
    conversation_history: list[dict],
    system_prompt: str | None = None,
    dry_run: bool = False,
) -> tuple[str, AgentAction, int, list[AgentAction]]:

    # Casual message check — API call skip karo
    if is_casual_message(message):
        return random.choice(POLITE_REPLIES), AgentAction(type="none"), 0, []

    if not system_prompt:
        try:
            from app.db.database import AsyncSessionLocal
            from app.services import settings_service
            async with AsyncSessionLocal() as db:
                s = await settings_service.get_settings(db)
                system_prompt = settings_service.build_system_prompt(s)
        except Exception:
            system_prompt = "You are a helpful AI assistant."

    messages = [
        {"role": "system", "content": system_prompt},
        *conversation_history,
        {"role": "user", "content": message}
    ]

    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=TOOLS,
        tool_choice="auto",
        max_tokens=1024,
        parallel_tool_calls=True,
    )

    choice = response.choices[0]
    tokens = response.usage.total_tokens
    actions = []
    reply = ""

    if choice.finish_reason == "tool_calls":
        task_titles = []

        for tool_call in choice.message.tool_calls:
            tool_name = tool_call.function.name
            tool_input = json.loads(tool_call.function.arguments)

            if tool_name == "create_jira_task":
                title = tool_input.get("title", "New Task")
                if title in task_titles:
                    continue
                task_titles.append(title)
                actions.append(AgentAction(
                    type="none" if dry_run else "create_task",
                    payload=tool_input
                ))

            elif tool_name == "create_invoice":
                actions.append(AgentAction(
                    type="none" if dry_run else "send_invoice",
                    payload=tool_input
                ))

            elif tool_name == "escalate_to_human":
                actions.append(AgentAction(
                    type="none" if dry_run else "escalate",
                    payload=tool_input
                ))

        task_actions = [a for a in actions if a.type == "create_task"]
        invoice_actions = [a for a in actions if a.type == "send_invoice"]
        escalate_actions = [a for a in actions if a.type == "escalate"]

        reply_parts = []

        if task_actions:
            if len(task_actions) == 1:
                title = task_actions[0].payload.get("title", "Task")
                reply_parts.append(f"I've created a support task: '{title}'. Our team will be in touch shortly.")
            else:
                titles = [a.payload.get("title", "Task") for a in task_actions]
                tasks_list = "\n".join([f"• {t}" for t in titles])
                reply_parts.append(f"I've created {len(task_actions)} separate tasks:\n{tasks_list}\nOur team will be in touch shortly.")

        if invoice_actions:
            desc = invoice_actions[0].payload.get("description", "")
            amount = invoice_actions[0].payload.get("amount", 0)
            reply_parts.append(f"Invoice generated for {desc} (${amount:.2f}).")

        if escalate_actions:
            reply_parts.append("I'm connecting you with one of our team members who will help you better.")

        reply = " ".join(reply_parts)

        if not reply:
            reply = "I've processed your request. Our team will be in touch shortly."

        if dry_run:
            reply += " [DRY RUN — no actual actions taken]"

    else:
        reply = choice.message.content or "I'm sorry, I could not process your request."

    primary_action = actions[0] if actions else AgentAction(type="none")
    return reply, primary_action, tokens, actions


async def extract_client_info(messages: list[dict]) -> dict:
    """Extract name and email from conversation if mentioned."""
    info = {"name": None, "email": None}

    for msg in messages:
        if msg["role"] == "user":
            email_match = re.search(
                r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
                msg["content"]
            )
            if email_match:
                info["email"] = email_match.group()

            name_match = re.search(
                r"(?:my name is|i am|i'm|this is)\s+([A-Za-z]+(?:\s+[A-Za-z]+)?)",
                msg["content"], re.IGNORECASE
            )
            if name_match:
                info["name"] = name_match.group(1).title()

    return info