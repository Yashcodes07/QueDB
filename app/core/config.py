from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):

    # ─── Database ────────────────────────────────────────────────
    DATABASE_URL: str

    # ─── JWT ─────────────────────────────────────────────────────
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60

    # ─── App ─────────────────────────────────────────────────────
    APP_NAME: str = "QueDB"
    DEBUG: bool = False                        # ✅ default False for production

    # ─── CORS ────────────────────────────────────────────────────
    ALLOWED_ORIGINS: List[str] = [             # ✅ NEW
        "http://localhost:5173",               # Vite dev server
        "http://localhost:3000",               # fallback
    ]

    # ─── Groq AI ─────────────────────────────────────────────────
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "llama3-70b-8192"
    MAX_SQL_RETRIES: int = 3
    SQL_QUERY_TIMEOUT: int = 30

    # ─── ChromaDB ────────────────────────────────────────────────
    CHROMA_PERSIST_DIR: str = "./chroma_db"    # ✅ NEW — overridden to /app/chroma_db on Railway

    # ─── Environment ─────────────────────────────────────────────
    ENVIRONMENT: str = "development"           # ✅ NEW — "development" | "production"

    @property
    def is_production(self) -> bool:           # ✅ handy guard for prod-only logic
        return self.ENVIRONMENT == "production"

    model_config = {                           # ✅ Pydantic v2 style (replaces inner Config class)
        "env_file": ".env",
        "env_file_encoding": "utf-8",
        "case_sensitive": True,
    }


settings = Settings()