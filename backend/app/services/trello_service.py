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
    client_id: str | None = None,
    db=None,
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
        card_data = {
            "id": card["id"],
            "name": card["name"],
            "url": card["shortUrl"],
            "list": "ToDo",
        }

        # Save to DB if client_id provided
        if client_id and db:
            from app.db.models import TrelloCard, gen_uuid
            db.add(TrelloCard(
                id=gen_uuid(),
                card_id=card["id"],
                client_id=client_id,
                title=title,
                trello_url=card["shortUrl"],
            ))
            await db.flush()

        return card_data


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


async def update_card_status(card_id: str, list_name: str) -> dict:
    """Move card to different list (ToDo, In Progress, In Review, Done)."""

    # Get all lists from board
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRELLO_BASE_URL}/boards/{settings.trello_board_id}/lists",
            params=get_auth_params(),
        )
        lists = response.json()

    # Find target list by name
    target_list = next(
        (l for l in lists if l['name'].lower() == list_name.lower()), None
    )
    if not target_list:
        raise ValueError(f"List '{list_name}' not found on board")

    # Move card
    async with httpx.AsyncClient() as client:
        response = await client.put(
            f"{TRELLO_BASE_URL}/cards/{card_id}",
            params={**get_auth_params(), "idList": target_list['id']},
        )
        response.raise_for_status()
        return {"success": True, "list": list_name}


async def get_board_cards() -> list:
    """Get all open cards with list info."""
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{TRELLO_BASE_URL}/boards/{settings.trello_board_id}/cards",
            params={**get_auth_params(), "fields": "id,name,desc,idList,dateLastActivity,url"},
        )
        cards = response.json()

        # Get lists for name mapping
        lists_res = await client.get(
            f"{TRELLO_BASE_URL}/boards/{settings.trello_board_id}/lists",
            params=get_auth_params(),
        )
        lists = {l['id']: l['name'] for l in lists_res.json()}

    return [
        {**card, "list_name": lists.get(card['idList'], 'Unknown')}
        for card in cards
    ]