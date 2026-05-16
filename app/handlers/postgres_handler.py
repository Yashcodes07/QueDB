# app/handlers/postgres_handler.py
# PostgreSQL specific handler

from sqlalchemy import inspect, text
from app.handlers.base import BaseHandler


class PostgresHandler(BaseHandler):

    def get_connection_url(self) -> str:
        """
        Builds PostgreSQL connection URL.
        Handles both password and no-password cases (Mac local dev often has no password).
        """
        user = self.config.get("username", "")
        password = self.config.get("password", "")
        host = self.config.get("host", "localhost")
        port = self.config.get("port", 5432)
        db   = self.config.get("database", "")

        if password:
            return f"postgresql+psycopg2://{user}:{password}@{host}:{port}/{db}"
        else:
            return f"postgresql+psycopg2://{user}@{host}:{port}/{db}"

    def test_connection(self) -> dict:
        """Tries SELECT 1 — the universal DB health check."""
        try:
            engine = self.get_engine()
            with engine.connect() as conn:
                conn.execute(text("SELECT 1"))
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_schema(self) -> dict:
        """
        Uses SQLAlchemy inspector to read:
        - All table names
        - Columns (name, type, nullable, primary key)
        - Foreign keys (relationships between tables)
        - Row count per table
        - 3 sample rows per table
        """
        engine = self.get_engine()
        inspector = inspect(engine)
        schema = {}

        with engine.connect() as conn:
            for table in inspector.get_table_names():
                columns = [
                    {
                        "name":        col["name"],
                        "type":        str(col["type"]),
                        "nullable":    col.get("nullable", True),
                        "primary_key": col.get("primary_key", False),
                    }
                    for col in inspector.get_columns(table)
                ]
                foreign_keys = [
                    {
                        "column":            fk["constrained_columns"],
                        "references_table":  fk["referred_table"],
                        "references_column": fk["referred_columns"],
                    }
                    for fk in inspector.get_foreign_keys(table)
                ]
                try:
                    row_count = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar()
                except Exception:
                    row_count = None
                try:
                    res = conn.execute(text(f'SELECT * FROM "{table}" LIMIT 3'))
                    cols = list(res.keys())
                    sample_rows = [{k: str(v) for k, v in zip(cols, row)} for row in res.fetchall()]
                except Exception:
                    sample_rows = []

                schema[table] = {
                    "columns":      columns,
                    "foreign_keys": foreign_keys,
                    "row_count":    row_count,
                    "sample_rows":  sample_rows,
                }
        return schema

    def run_query(self, sql: str) -> dict:
        """Execute raw SQL and return structured results."""
        try:
            engine = self.get_engine()
            with engine.connect() as conn:
                result = conn.execute(text(sql))
                columns = list(result.keys())
                rows = [list(row) for row in result.fetchall()]
                return {
                    "success":   True,
                    "columns":   columns,
                    "rows":      rows,
                    "row_count": len(rows),
                }
        except Exception as e:
            return {"success": False, "error": str(e), "columns": [], "rows": []}