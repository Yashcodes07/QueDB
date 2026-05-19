import ssl
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import DeclarativeBase
from app.core.config import settings

# Build SSL context for Supabase
def get_engine():
    db_url = settings.DATABASE_URL

    # Remove any ssl params from URL — we handle SSL separately
    db_url = db_url.replace("?ssl=true", "").replace("?sslmode=require", "").replace("&sslmode=require", "")

    # Check if connecting to Supabase (needs SSL)
    if "supabase.co" in db_url:
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
