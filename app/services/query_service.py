from sqlalchemy.ext.asyncio import AsyncSession
from app.db.crud.connection import get_connection_by_id
from app.ai.sql_agent import build_sql_database, build_sql_agent, run_nl_query
from app.ai.schema_inspector import get_schema_info, schema_to_prompt_text
from app.ai.error_explainer import explain_sql_error, suggest_followup_questions
from app.models.models import DatabaseConnection


def _build_sync_url(conn: DatabaseConnection) -> str:
    db_type = conn.db_type.lower()
    if db_type in ("postgresql", "postgres"):
        return f"postgresql+psycopg2://{conn.username}@{conn.host}:{conn.port or 5432}/{conn.database}"
    elif db_type == "mysql":
        return f"mysql+pymysql://{conn.username}:{conn.password}@{conn.host}:{conn.port or 3306}/{conn.database}"
    elif db_type == "sqlite":
        return f"sqlite:///{conn.database}"
    else:
        raise ValueError(f"Unsupported db_type: {db_type}")


async def run_natural_language_query(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
    question: str,
) -> dict:
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found or access denied"}

    try:
        sync_url = _build_sync_url(conn)
    except ValueError as e:
        return {"success": False, "error": str(e)}

    try:
        schema = get_schema_info(sync_url)
        schema_text = schema_to_prompt_text(schema)
    except Exception as e:
        return {"success": False, "error": f"Could not connect to database: {e}"}

    try:
        sql_db = build_sql_database({
            "db_type":  conn.db_type,
            "host":     conn.host,
            "port":     conn.port,
            "database": conn.database,
            "username": conn.username,
            "password": conn.password or "",
        })
        agent = build_sql_agent(sql_db)
    except Exception as e:
        return {"success": False, "error": f"Could not build SQL agent: {e}"}

    result = run_nl_query(agent, question)

    if not result["success"]:
        error_explanation = explain_sql_error(
            original_question=question,
            failed_sql="(SQL generation failed)",
            error_message=result["error"],
            schema_context=schema_text,
        )
        return {
            "success": False,
            "question": question,
            "answer": None,
            "schema": schema,
            "followup_questions": [],
            "error_explanation": error_explanation,
        }

    followups = suggest_followup_questions(
        original_question=question,
        sql_result_summary=result["answer"][:500],
        schema_context=schema_text,
    )

    return {
        "success": True,
        "question": question,
        "answer": result["answer"],
        "schema": schema,
        "followup_questions": followups,
        "error_explanation": None,
    }


async def get_connection_schema(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
) -> dict:
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}
    try:
        sync_url = _build_sync_url(conn)
        schema = get_schema_info(sync_url)
        return {"success": True, "schema": schema}
    except Exception as e:
        return {"success": False, "error": str(e)}
