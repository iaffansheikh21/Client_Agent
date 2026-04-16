import asyncio
from app.db.database import engine
from sqlalchemy import text


async def migrate():
    async with engine.begin() as conn:
        await conn.execute(text("""
            CREATE TABLE IF NOT EXISTS trello_cards (
                id VARCHAR(36) PRIMARY KEY,
                card_id VARCHAR(100) UNIQUE NOT NULL,
                client_id VARCHAR(36) REFERENCES clients(id),
                title VARCHAR(500) NOT NULL,
                trello_url VARCHAR(500),
                created_at TIMESTAMP DEFAULT NOW()
            );
        """))
        print("✅ trello_cards table created")


asyncio.run(migrate())
