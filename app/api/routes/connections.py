from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db
from app.db.crud.connection import create_connection, get_connections, get_connection_by_id, delete_connection
from app.core.security import get_current_user
from app.models.models import User
from app.schemas.schemas import ConnectionCreate, ConnectionOut

router = APIRouter(prefix="/connections", tags=["Connections"])

@router.post("/", response_model=ConnectionOut, status_code=201)
async def add_connection(payload: ConnectionCreate, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await create_connection(db, payload, current_user.id)

@router.get("/", response_model=list[ConnectionOut])
async def list_connections(db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    return await get_connections(db, current_user.id)

@router.get("/{conn_id}", response_model=ConnectionOut)
async def get_connection(conn_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    conn = await get_connection_by_id(db, conn_id, current_user.id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    return conn

@router.delete("/{conn_id}", status_code=204)
async def remove_connection(conn_id: int, db: AsyncSession = Depends(get_db), current_user: User = Depends(get_current_user)):
    deleted = await delete_connection(db, conn_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Connection not found")
