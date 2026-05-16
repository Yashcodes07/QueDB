# app/handlers/registry.py
# ─────────────────────────────────────────────────────────────────────────────
# HANDLER REGISTRY
# This is like a phone book for handlers.
# "I need a PostgreSQL handler" → registry returns PostgresHandler
# "I need a MySQL handler" → registry returns MySQLHandler
#
# The query_service.py uses this to get the right handler
# without knowing the specifics of each database type.
# ─────────────────────────────────────────────────────────────────────────────

from app.handlers.base import BaseHandler
from app.handlers.postgres_handler import PostgresHandler
from app.handlers.mysql_handler import MySQLHandler
from app.handlers.sqlite_handler import SQLiteHandler
from app.handlers.csv_handler import CSVHandler


# Map of db_type string → handler class
HANDLER_REGISTRY = {
    "postgresql": PostgresHandler,
    "postgres":   PostgresHandler,
    "mysql":      MySQLHandler,
    "sqlite":     SQLiteHandler,
    "csv":        CSVHandler,
}


def get_handler(db_type: str, config: dict) -> BaseHandler:
    """
    Returns an initialized handler for the given db_type.

    Usage:
        handler = get_handler("postgresql", {"host": "localhost", ...})
        schema  = handler.get_schema()
        result  = handler.run_query("SELECT * FROM users")
    """
    db_type = db_type.lower().strip()
    handler_class = HANDLER_REGISTRY.get(db_type)

    if not handler_class:
        supported = list(HANDLER_REGISTRY.keys())
        raise ValueError(f"Unsupported db_type: '{db_type}'. Supported: {supported}")

    return handler_class(config)


def get_supported_types() -> list[str]:
    """Returns list of all supported database types."""
    return list(set(HANDLER_REGISTRY.keys()))