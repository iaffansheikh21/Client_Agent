from fastapi import APIRouter, HTTPException
from app.services import trello_service

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.get("/")
async def get_tasks():
    """Get all Trello cards."""
    try:
        cards = await trello_service.get_board_cards()
        return cards
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{card_id}/status")
async def update_task_status(card_id: str, list_name: str):
    """Move Trello card to different list."""
    try:
        result = await trello_service.update_card_status(card_id, list_name)
        return result
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))