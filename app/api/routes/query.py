from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.services.query_service import run_natural_language_query, get_connection_schema

router = APIRouter(prefix="/query", tags=["Query"])


class NLQueryRequest(BaseModel):
    connection_id: int
    question: str


@router.post("/ask")
async def ask_question(
    payload: NLQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not payload.question.strip():
        raise HTTPException(status_code=400, detail="Question cannot be empty")
    result = await run_natural_language_query(
        db=db,
        connection_id=payload.connection_id,
        user_id=current_user.id,
        question=payload.question,
    )
    return result


@router.get("/schema/{connection_id}")
async def get_schema(
    connection_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await get_connection_schema(
        db=db,
        connection_id=connection_id,
        user_id=current_user.id,
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result
