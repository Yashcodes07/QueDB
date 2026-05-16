# app/ai/hybrid_search.py
# ─────────────────────────────────────────────────────────────────────────────
# HYBRID SEARCH = Vector Search + SQL Agent combined
#
# Why hybrid?
# - Vector search alone: good at finding WHAT to query, bad at exact numbers
# - SQL agent alone: good at exact queries, needs good context to generate SQL
# - Combined: use vector search to find relevant schema context,
#   then pass that context to SQL agent for accurate queries
#
# This gives significantly better results especially on complex questions.
# ─────────────────────────────────────────────────────────────────────────────

from app.ai.vector_store import search_documents
from app.ai.sql_agent import build_sql_database, build_sql_agent, run_nl_query
from app.ai.error_explainer import explain_sql_error, suggest_followup_questions
from app.models.models import DatabaseConnection


def _build_agent_url(conn: DatabaseConnection) -> str:
    db_type = conn.db_type.lower()
    if db_type in ("postgresql", "postgres"):
        if conn.password:
            return f"postgresql+psycopg2://{conn.username}:{conn.password}@{conn.host}:{conn.port or 5432}/{conn.database}"
        return f"postgresql+psycopg2://{conn.username}@{conn.host}:{conn.port or 5432}/{conn.database}"
    elif db_type == "mysql":
        return f"mysql+pymysql://{conn.username}:{conn.password}@{conn.host}:{conn.port or 3306}/{conn.database}"
    elif db_type == "sqlite":
        return f"sqlite:///{conn.database}"
    raise ValueError(f"Unsupported: {conn.db_type}")


def _get_relevant_context(collection_name: str, question: str) -> str:
    """
    Searches the knowledge base for schema context relevant to the question.
    Returns a formatted string to inject into the AI prompt.

    Example:
    Question: "how many active users signed up last month?"
    Returns:
    "Relevant schema context:
     - Table users has columns: id, email, is_active, created_at
     - Column is_active in table users has type BOOLEAN. This field is required.
     - Column created_at in table users has type TIMESTAMP."
    """
    result = search_documents(collection_name, question, n_results=6)
    if not result["success"] or not result["results"]:
        return ""

    # Only use results with similarity > 0.3 (filter out noise)
    relevant = [r for r in result["results"] if r["similarity"] > 0.3]
    if not relevant:
        return ""

    context_lines = ["Relevant schema context:"]
    for r in relevant[:5]:
        context_lines.append(f" - {r['text']}")

    return "".join(context_lines)


def run_hybrid_query(
    conn: DatabaseConnection,
    question: str,
    collection_name: str,
) -> dict:
    """
    Full hybrid search pipeline:
    1. Search knowledge base for relevant schema context
    2. Build SQL agent with that context injected
    3. Run the query
    4. Return answer + context used

    The key difference from plain SQL agent:
    The agent gets a richer, focused context about relevant tables
    instead of the full schema — leads to better SQL generation.
    """
    # Step 1: Get relevant context from vector store
    kb_context = _get_relevant_context(collection_name, question)

    # Step 2: Build question with context injected
    enhanced_question = question
    if kb_context:
        enhanced_question = f"{question}{kb_context}"

    # Step 3: Build SQL agent
    try:
        config = {
            "db_type":  conn.db_type,
            "host":     conn.host,
            "port":     conn.port,
            "database": conn.database,
            "username": conn.username,
            "password": conn.password or "",
        }
        sql_db = build_sql_database(config)
        agent  = build_sql_agent(sql_db)
    except Exception as e:
        return {
            "success":       False,
            "question":      question,
            "answer":        None,
            "error":         str(e),
            "context_used":  kb_context,
        }

    # Step 4: Run the query with enhanced context
    result = run_nl_query(agent, enhanced_question)

    return {
        "success":      result["success"],
        "question":     question,
        "answer":       result.get("answer"),
        "error":        result.get("error"),
        "context_used": kb_context,
        "kb_enhanced":  bool(kb_context),  # was knowledge base used?
    }