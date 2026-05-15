from sqlalchemy import create_engine, inspect, text


def get_schema_info(connection_url: str) -> dict:
    engine = create_engine(connection_url)
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
                cols = res.keys()
                sample_rows = [{k: str(v) for k, v in zip(cols, row)} for row in res.fetchall()]
            except Exception:
                sample_rows = []
            schema[table] = {
                "columns":      columns,
                "foreign_keys": foreign_keys,
                "row_count":    row_count,
                "sample_rows":  sample_rows,
            }
    engine.dispose()
    return schema


def schema_to_prompt_text(schema: dict) -> str:
    lines = []
    for table, info in schema.items():
        lines.append(f"Table: {table} ({info['row_count']} rows)")
        for col in info["columns"]:
            pk   = " [PK]" if col["primary_key"] else ""
            null = "" if col["nullable"] else " NOT NULL"
            lines.append(f"  - {col['name']} ({col['type']}){pk}{null}")
        lines.append("")
    return "\n".join(lines)