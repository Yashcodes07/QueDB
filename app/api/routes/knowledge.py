from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.db.session import get_db
from app.core.security import get_current_user
from app.models.models import User
from app.db.crud.connection import get_connection_by_id

router = APIRouter(prefix="/knowledge", tags=["Knowledge Base"])


class SearchRequest(BaseModel):
    connection_id: int
    query: str
    n_results: int = 5


class HybridQueryRequest(BaseModel):
    connection_id: int
    question: str


@router.post("/ingest/{connection_id}")
async def ingest(
    connection_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.knowledge_service import ingest_schema
    result = await ingest_schema(db=db, connection_id=connection_id, user_id=current_user.id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.get("/status/{connection_id}")
async def kb_status(
    connection_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.knowledge_service import get_kb_status
    return await get_kb_status(db=db, connection_id=connection_id, user_id=current_user.id)


@router.post("/search")
async def search_kb(
    payload: SearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.knowledge_service import search_knowledge_base
    result = await search_knowledge_base(
        db=db, connection_id=payload.connection_id,
        user_id=current_user.id, query=payload.query, n_results=payload.n_results,
    )
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/ask")
async def hybrid_ask(
    payload: HybridQueryRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.ai.hybrid_search import run_hybrid_query
    conn = await get_connection_by_id(db, payload.connection_id, current_user.id)
    if not conn:
        raise HTTPException(status_code=404, detail="Connection not found")
    collection = f"kb_{payload.connection_id}"
    result = run_hybrid_query(conn=conn, question=payload.question, collection_name=collection)
    return result
