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
    company_name: str = "DS Technologies Pvt Ltd"
    company_services: str = (
    "We provide end-to-end digital services including custom web development, "
    "UI/UX and graphic design, SEO (search engine optimization), mobile app development "
    "(Android & iOS), custom software development, domain and hosting solutions, "
    "and digital marketing services such as social media marketing and paid advertising. "
    "We help businesses build, grow, and scale their online presence with modern and scalable solutions."
    )
    agent_name: str = "DigiBot"

    # Integrations (optional)
    twilio_account_sid: str = ""
    twilio_auth_token: str = ""
    twilio_whatsapp_number: str = ""
    slack_bot_token: str = ""
    slack_alert_channel: str = ""
    trello_api_key: str = ""
    trello_token: str = ""
    trello_board_id: str = ""
    trello_list_id: str = ""
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    resend_api_key: str = ""
    alert_email: str = ""

    class Config:
        env_file = ".env"


@lru_cache()
def get_settings() -> Settings:
    return Settings()
