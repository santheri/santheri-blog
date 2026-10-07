import os
from functools import lru_cache
from typing import Optional
from pydantic import Field, AliasChoices
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    """
    Application settings managed by pydantic-settings.
    Automatically reads from backend/.env locally, and seamlessly
    falls back to real environment variables in production (such as Render.com).
    """
    # Database Settings
    database_url: Optional[str] = Field(
        default=None,
        validation_alias=AliasChoices("DATABASE_URL", "database_url", "NEON_DATABASE_URL", "neon_database_url")
    )

    # SMTP Email Delivery Settings
    smtp_host: str = Field(default="", validation_alias=AliasChoices("SMTP_HOST", "smtp_host"))
    smtp_port: int = Field(default=587, validation_alias=AliasChoices("SMTP_PORT", "smtp_port"))
    smtp_user: str = Field(default="", validation_alias=AliasChoices("SMTP_USER", "smtp_user"))
    smtp_password: str = Field(default="", validation_alias=AliasChoices("SMTP_PASSWORD", "smtp_password"))
    from_email: str = Field(default="", validation_alias=AliasChoices("FROM_EMAIL", "from_email"))
    from_name: str = Field(default="Santheri", validation_alias=AliasChoices("FROM_NAME", "from_name"))
    blog_base_url: str = Field(default="http://localhost:5173", validation_alias=AliasChoices("BLOG_BASE_URL", "blog_base_url"))

    # Server & Cloud Deployment Settings
    port: int = Field(default=8000, validation_alias=AliasChoices("PORT", "port"))
    render: bool = Field(default=False, validation_alias=AliasChoices("RENDER", "render"))

    # Security & Admin Authentication
    admin_password: str = Field(
        default="santheri2026",
        validation_alias=AliasChoices("ADMIN_PASSWORD", "admin_password")
    )
    enable_docs: bool = Field(
        default=True,
        validation_alias=AliasChoices("ENABLE_DOCS", "enable_docs")
    )


    # Config dict: look for .env file in backend/ directory, fallback to system env vars
    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False
    )

    @property
    def is_smtp_configured(self) -> bool:
        return bool(self.smtp_host and self.smtp_user and self.smtp_password)

    @property
    def sender_email(self) -> str:
        return (self.from_email.strip() or self.smtp_user.strip() or "newsletter@santheriblog.com")

@lru_cache()
def get_settings() -> Settings:
    return Settings()

settings = get_settings()
