# app/services/query_service.py  (UPDATED for Week 3)
# Now uses the handler registry instead of building URLs directly.
# The SQL agent still uses its own connection — handlers are for schema + direct queries.

from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud.connection import get_connection_by_id
from app.handlers.registry import get_handler
from app.ai.sql_agent import build_sql_database, build_sql_agent, run_nl_query
from app.ai.schema_inspector import schema_to_prompt_text
from app.ai.error_explainer import explain_sql_error, suggest_followup_questions
from app.models.models import DatabaseConnection


def _conn_to_config(conn: DatabaseConnection) -> dict:
    """Convert our DB model to the config dict handlers expect."""
    return {
        "db_type":  conn.db_type,
        "host":     conn.host,
        "port":     conn.port,
        "database": conn.database,
        "username": conn.username,
        "password": conn.password or "",
    }


def _build_agent_url(conn: DatabaseConnection) -> str:
    """Build sync URL for LangChain SQL Agent."""
    db_type = conn.db_type.lower()
    if db_type in ("postgresql", "postgres"):
        if conn.password:
            return f"postgresql+psycopg2://{conn.username}:{conn.password}@{conn.host}:{conn.port or 5432}/{conn.database}"
        return f"postgresql+psycopg2://{conn.username}@{conn.host}:{conn.port or 5432}/{conn.database}"
    elif db_type == "mysql":
        return f"mysql+pymysql://{conn.username}:{conn.password}@{conn.host}:{conn.port or 3306}/{conn.database}"
    elif db_type == "sqlite":
        return f"sqlite:///{conn.database}"
    elif db_type == "csv":
        return "sqlite://"   # CSV handler manages its own in-memory DB
    raise ValueError(f"Unsupported db_type: {db_type}")


async def test_connection(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
) -> dict:
    """
    NEW in Week 3 — tests if a saved connection actually works.
    Uses the handler registry to get the right handler, then calls test_connection().
    """
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}
    try:
        config  = _conn_to_config(conn)
        handler = get_handler(conn.db_type, config)
        result  = handler.test_connection()
        handler.dispose()
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_connection_schema(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
) -> dict:
    """
    UPDATED — now uses handler registry instead of schema_inspector directly.
    Works for ALL db types including CSV.
    """
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}
    try:
        config  = _conn_to_config(conn)
        handler = get_handler(conn.db_type, config)
        schema  = handler.get_schema()
        handler.dispose()
        return {"success": True, "schema": schema}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def run_direct_query(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
    sql: str,
) -> dict:
    """
    NEW in Week 3 — run raw SQL directly (no AI needed).
    Used for power users who want to write their own SQL.
    """
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}
    try:
        config  = _conn_to_config(conn)
        handler = get_handler(conn.db_type, config)
        result  = handler.run_query(sql)
        handler.dispose()
        return result
    except Exception as e:
        return {"success": False, "error": str(e)}


async def run_natural_language_query(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
    question: str,
) -> dict:
    """
    SAME as Week 2 but schema now comes from handler registry.
    AI agent still uses LangChain — unchanged.
    """
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found or access denied"}

    # Get schema via handler
    try:
        config  = _conn_to_config(conn)
        handler = get_handler(conn.db_type, config)
        schema  = handler.get_schema()
        schema_text = schema_to_prompt_text(schema)
        handler.dispose()
    except Exception as e:
        return {"success": False, "error": f"Could not connect to database: {e}"}

    # Build AI agent
    try:
        agent_url = _build_agent_url(conn)
        sql_db    = build_sql_database({"db_type": conn.db_type, **config})
        agent     = build_sql_agent(sql_db)
    except Exception as e:
        return {"success": False, "error": f"Could not build SQL agent: {e}"}

    # Run query
    result = run_nl_query(agent, question)

    if not result["success"]:
        error_explanation = explain_sql_error(
            original_question=question,
            failed_sql="(SQL generation failed)",
            error_message=result["error"],
            schema_context=schema_text,
        )
        return {
            "success": False, "question": question, "answer": None,
            "schema": schema, "followup_questions": [],
            "error_explanation": error_explanation,
        }

    followups = suggest_followup_questions(
        original_question=question,
        sql_result_summary=result["answer"][:500],
        schema_context=schema_text,
    )

    return {
        "success": True, "question": question,
        "answer": result["answer"], "schema": schema,
        "followup_questions": followups, "error_explanation": None,
    }