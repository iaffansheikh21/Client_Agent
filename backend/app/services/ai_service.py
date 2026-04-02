from openai import AsyncOpenAI
from app.config import get_settings
from app.models.schemas import AgentAction

settings = get_settings()

client = AsyncOpenAI(api_key=settings.openai_api_key)


def build_system_prompt() -> str:
    s = get_settings()
    return f"""You are {s.agent_name}, a professional AI assistant for {s.company_name}.

Our services include: {s.company_services}

Your responsibilities:
1. Answer client queries about our services professionally and helpfully
2. Create Trello tasks when a client reports a bug, requests a feature, or needs support work done
3. Generate invoices when a client asks about billing or payment
4. Escalate to a human agent when: the issue is complex, the client is angry, or you are not confident

Communication style:
- Be professional but friendly
- Keep responses concise (3-5 sentences max for simple queries)
- Always confirm before creating tasks or invoices

When you need to take an action, use the provided tools.
"""


TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "create_trello_task",
            "description": "Create a Trello task when client reports a bug, requests a feature, or needs support work.",
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
            "description": "Generate a Stripe invoice when client asks about billing or payment.",
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


async def process_message(
    message: str,
    conversation_history: list[dict],
) -> tuple[str, AgentAction, int]:

    messages = [
        {"role": "system", "content": build_system_prompt()},
        *conversation_history,
        {"role": "user", "content": message}
    ]

    try:
        response = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages,
            tools=TOOLS,
            tool_choice="auto",
            max_tokens=1024,
        )
    except Exception as e:
        print(f"OpenAI ERROR: {e}")
        return "I'm sorry, I'm having trouble processing your request right now. Please try again.", AgentAction(type="none"), 0

    choice = response.choices[0]
    tokens = response.usage.total_tokens
    action = AgentAction(type="none")
    reply = ""

    # Tool call
    if choice.finish_reason == "tool_calls":
        tool_call = choice.message.tool_calls[0]
        tool_name = tool_call.function.name

        import json
        tool_input = json.loads(tool_call.function.arguments)

        if tool_name == "create_jira_task":
            action = AgentAction(type="create_task", payload=tool_input)
            reply = f"I've created a support task: '{tool_input['title']}'. Our team will be in touch shortly."

        elif tool_name == "create_invoice":
            action = AgentAction(type="send_invoice", payload=tool_input)
            reply = f"I'll send you an invoice for {tool_input['description']} (${tool_input['amount']:.2f})."

        elif tool_name == "escalate_to_human":
            action = AgentAction(type="escalate", payload=tool_input)
            reply = "I'm connecting you with one of our team members who will help you better."

    # Normal response
    else:
        reply = choice.message.content or "I'm sorry, I could not process your request."

    return reply, action, tokens