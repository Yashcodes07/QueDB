# app/handlers/base.py
# ─────────────────────────────────────────────────────────────────────────────
# WHAT IS A HANDLER?
# A handler is a class that knows how to talk to ONE specific database type.
# Every handler has the same interface (methods), so the rest of the app
# doesn't need to know WHICH database it's talking to — it just calls
# the same methods and gets the same results back.
#
# This is the "Strategy Pattern" in software design.
# Base class defines the interface → each DB type implements it differently.
# ─────────────────────────────────────────────────────────────────────────────

from abc import ABC, abstractmethod


class BaseHandler(ABC):
    """
    Abstract base class for all database handlers.
    Every handler MUST implement these 4 methods.
    If a handler doesn't implement one, Python raises an error immediately.
    """

    def __init__(self, config: dict):
        """
        config is a dict with connection details:
        {
            "host": "localhost",
            "port": 5432,
            "database": "mydb",
            "username": "postgres",
            "password": "secret"
        }
        """
        self.config = config
        self._engine = None     # SQLAlchemy engine (created lazily)

    @abstractmethod
    def get_connection_url(self) -> str:
        """
        Returns the SQLAlchemy connection URL string.
        Example: "postgresql+psycopg2://user:pass@host:5432/db"
        Each handler builds its own URL format.
        """
        pass

    @abstractmethod
    def test_connection(self) -> dict:
        """
        Tries to connect and runs a simple query.
        Returns: {"success": True} or {"success": False, "error": "..."}
        Used when user adds a new connection — verify it works before saving.
        """
        pass

    @abstractmethod
    def get_schema(self) -> dict:
        """
        Returns full schema: all tables, columns, types, row counts.
        Used by: Schema Explorer UI + AI agent context.
        """
        pass

    @abstractmethod
    def run_query(self, sql: str) -> dict:
        """
        Executes raw SQL and returns results.
        Returns:
        {
            "success": True,
            "columns": ["id", "name", ...],
            "rows":    [[1, "Alice"], [2, "Bob"]],
            "row_count": 2
        }
        """
        pass

    def get_engine(self):
        """
        Creates SQLAlchemy engine lazily (only when first needed).
        Cached so we don't recreate it on every query.
        """
        if self._engine is None:
            from sqlalchemy import create_engine
            self._engine = create_engine(
                self.get_connection_url(),
                pool_pre_ping=True,     # auto-reconnect if connection drops
                pool_size=2,            # keep 2 connections in pool
                max_overflow=3,         # allow 3 extra connections at peak
            )
        return self._engine

    def dispose(self):
        """Clean up connection pool when done."""
        if self._engine:
            self._engine.dispose()
            self._engine = None