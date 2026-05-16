# app/handlers/csv_handler.py
# CSV handler — loads CSV into in-memory SQLite, then queries it like a real DB
#
# This is a clever trick:
# 1. User uploads/points to a CSV file
# 2. We load it into a temp SQLite database in memory
# 3. Now we can run real SQL queries on it!
# 4. This means ALL other handler methods work the same way

import pandas as pd
from sqlalchemy import create_engine, text, inspect
from app.handlers.base import BaseHandler


class CSVHandler(BaseHandler):

    def get_connection_url(self) -> str:
        """In-memory SQLite — data lives only in RAM while query runs."""
        return "sqlite://"

    def _load_csv_to_engine(self):
        """
        Reads the CSV file and loads it into an in-memory SQLite database.
        The table name = CSV filename without extension.
        Example: sales_data.csv → table name "sales_data"
        """
        csv_path = self.config.get("database", "")
        import os
        table_name = os.path.splitext(os.path.basename(csv_path))[0]
        table_name = table_name.replace(" ", "_").replace("-", "_")

        df = pd.read_csv(csv_path)
        engine = create_engine("sqlite://")   # fresh in-memory DB each time
        df.to_sql(table_name, engine, index=False, if_exists="replace")
        return engine, table_name

    def test_connection(self) -> dict:
        """Check if the CSV file exists and is readable."""
        csv_path = self.config.get("database", "")
        try:
            import os
            if not os.path.exists(csv_path):
                return {"success": False, "error": f"File not found: {csv_path}"}
            pd.read_csv(csv_path, nrows=1)  # try reading just 1 row
            return {"success": True}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_schema(self) -> dict:
        try:
            engine, table_name = self._load_csv_to_engine()
            inspector = inspect(engine)
            with engine.connect() as conn:
                columns = [
                    {
                        "name":        col["name"],
                        "type":        str(col["type"]),
                        "nullable":    True,
                        "primary_key": False,
                    }
                    for col in inspector.get_columns(table_name)
                ]
                row_count = conn.execute(text(f'SELECT COUNT(*) FROM "{table_name}"')).scalar()
                res = conn.execute(text(f'SELECT * FROM "{table_name}" LIMIT 3'))
                cols = list(res.keys())
                sample_rows = [{k: str(v) for k, v in zip(cols, row)} for row in res.fetchall()]

            return {
                table_name: {
                    "columns":      columns,
                    "foreign_keys": [],
                    "row_count":    row_count,
                    "sample_rows":  sample_rows,
                }
            }
        except Exception as e:
            return {"error": str(e)}

    def run_query(self, sql: str) -> dict:
        try:
            engine, _ = self._load_csv_to_engine()
            with engine.connect() as conn:
                result = conn.execute(text(sql))
                columns = list(result.keys())
                rows = [list(row) for row in result.fetchall()]
                return {"success": True, "columns": columns, "rows": rows, "row_count": len(rows)}
        except Exception as e:
            return {"success": False, "error": str(e), "columns": [], "rows": []}