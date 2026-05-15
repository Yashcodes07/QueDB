from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.models import DatabaseConnection
from app.schemas.schemas import ConnectionCreate

async def create_connection(db: AsyncSession, data: ConnectionCreate, user_id: int) -> DatabaseConnection:
    conn = DatabaseConnection(**data.model_dump(), owner_id=user_id)
    db.add(conn)
    await db.flush()
    return conn

async def get_connections(db: AsyncSession, user_id: int) -> list[DatabaseConnection]:
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.owner_id == user_id,
            DatabaseConnection.is_active == True,
        )
    )
    return result.scalars().all()

async def get_connection_by_id(db: AsyncSession, conn_id: int, user_id: int) -> DatabaseConnection | None:
    result = await db.execute(
        select(DatabaseConnection).where(
            DatabaseConnection.id == conn_id,
            DatabaseConnection.owner_id == user_id,
        )
    )
    return result.scalar_one_or_none()

async def delete_connection(db: AsyncSession, conn_id: int, user_id: int) -> bool:
    conn = await get_connection_by_id(db, conn_id, user_id)
    if not conn:
        return False
    conn.is_active = False
    return True
