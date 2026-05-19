import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

def get_engine():
    db_url = settings.DATABASE_URL
    # Remove ssl params — handled in connect_args
    for param in ["?sslmode=require", "?ssl=require", "?ssl=true", "&sslmode=require"]:
        db_url = db_url.replace(param, "")

    # SSL for both Neon and Supabase
    if any(x in db_url for x in ["neon.tech", "supabase.com", "supabase.co"]):
        ssl_context = ssl.create_default_context()
        ssl_context.check_hostname = False
        ssl_context.verify_mode = ssl.CERT_NONE
        connect_args = {"ssl": ssl_context}
    else:
        connect_args = {}

    return create_async_engine(
        db_url,
        echo=settings.DEBUG,
        pool_pre_ping=True,
        pool_size=5,
        max_overflow=10,
        connect_args=connect_args,
    )

engine = get_engine()

AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,
)

class Base(DeclarativeBase):
    pass

async def get_db():
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()