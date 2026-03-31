import httpx
from app.config import get_settings

settings = get_settings()

TRELLO_BASE_URL = "https://api.trello.com/1"


def get_auth_params():
    return {
        "key": settings.trello_api_key,
        "token": settings.trello_token,
    }


async def create_card(
    title: str,
    description: str,
    priority: str = "medium",
    task_type: str = "bug",
) -> dict:
    """Create a Trello card in ToDo list."""

    # Priority label colors
    priority_labels = {
        "low": "blue",
        "medium": "yellow",
        "high": "orange",
        "critical": "red",
    }

    # Task type prefix
    type_emoji = {
        "bug": "🐛 Bug",
        "feature": "✨ Feature",
        "support": "🛠 Support",
        "question": "❓ Question",
    }

    card_name = f"{type_emoji.get(task_type, '')} | {title}"

    card_desc = f"""## Client Request

{description}

---
**Priority:** {priority.upper()}
**Type:** {task_type.upper()}
**Created by:** AI Agent
"""

    params = {
        **get_auth_params(),
        "idList": settings.trello_list_id,
        "name": card_name,
        "desc": card_desc,
        "pos": "top",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{TRELLO_BASE_URL}/cards",
            params=params,
        )
        response.raise_for_status()
        card = response.json()
        print(f"✅ Trello card created: {card['shortUrl']}")
        return {
            "id": card["id"],
            "name": card["name"],
            "url": card["shortUrl"],
            "list": "ToDo",
        }


async def get_cards() -> list:
    """Get all cards from the board."""
    params = {
        **get_auth_params(),
        "cards": "open",
    }

    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRELLO_BASE_URL}/boards/{settings.trello_board_id}/cards",
            params=params,
        )
        response.raise_for_status()
        return response.json()