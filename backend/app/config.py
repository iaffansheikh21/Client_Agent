from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    # App
    app_name: str = "AI Agent"
    app_env: str = "development"
    secret_key: str = "change-me"

    # Database
    database_url: str

    # AI
    openai_api_key: str

    # Agent personality
    company_name: str = "Our Company"
    company_services: str = "Software development and consulting"
    agent_name: str = "Alex"

    # Integrations (optional)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = ""
    slack_bot_token: str = ""
    trello_api_key: str = ""
    trello_token: str = ""
    trello_board_id: str = ""
    trello_list_id: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
