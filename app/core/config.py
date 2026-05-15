from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Database
    DATABASE_URL: str

    # JWT
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # App
    APP_NAME: str = "QueDB"
    DEBUG: bool = True

    # Groq AI
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    MAX_SQL_RETRIES: int = 3
    SQL_QUERY_TIMEOUT: int = 30

    class Config:
        env_file = ".env"


settings = Settings()