# app/api/routes/query.py  (UPDATED for Week 3)
# Added 2 new endpoints: test_connection and direct SQL query

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.services.query_service import (
    run_natural_language_query,
    get_connection_schema,
    test_connection,
    run_direct_query,
)

router = APIRouter(prefix="/query", tags=["Query"])


class NLQueryRequest(BaseModel):
    connection_id: int
    question: str


class DirectQueryRequest(BaseModel):
    connection_id: int
    sql: str


@router.post("/ask")
async def ask_question(
    payload: NLQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Ask a plain English question — AI converts to SQL and returns answer."""
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    return await run_natural_language_query(
        db=db, connection_id=payload.connection_id,
        user_id=current_user.id, question=payload.question,
    )


@router.get("/schema/{connection_id}")
async def get_schema(
    connection_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Returns full schema of a connected database."""
    result = await get_connection_schema(db=db, connection_id=connection_id, user_id=current_user.id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/test/{connection_id}")
async def test_conn(
    connection_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    NEW — Tests if a saved connection actually works.
    Returns {"success": true} or {"success": false, "error": "..."}
    Call this after adding a new connection to verify it's correct.
    """
    return await test_connection(db=db, connection_id=connection_id, user_id=current_user.id)


@router.post("/sql")
async def run_sql(
    payload: DirectQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    NEW — Run raw SQL directly on a connection (no AI).
    For power users who want to write their own queries.
    Returns columns + rows + row_count.
    """
    if not payload.sql.strip():
        raise HTTPException(status_code=400, detail="SQL cannot be empty")
    return await run_direct_query(
        db=db, connection_id=payload.connection_id,
        user_id=current_user.id, sql=payload.sql,
    )