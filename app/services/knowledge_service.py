from sqlalchemy.ext.asyncio import AsyncSession

from app.db.crud.connection import get_connection_by_id
from app.handlers.registry import get_handler
from app.ai.vector_store import (
    add_documents,
    search_documents,
    delete_collection,
    get_collection_info,
)


def _collection_name(connection_id: int) -> str:
    return f"kb_{connection_id}"


def _schema_to_documents(schema: dict) -> tuple:
    documents = []
    metadatas = []

    for table_name, table_info in schema.items():
        col_names = [c["name"] for c in table_info["columns"]]
        row_count = table_info.get("row_count", 0)

        table_doc = (
            f"Table {table_name} contains {row_count} rows. "
            f"Columns: {', '.join(col_names)}. "
            f"Use this table for queries about {table_name}."
        )
        documents.append(table_doc)
        metadatas.append({"type": "table", "table": table_name})

        for col in table_info["columns"]:
            pk_text   = " This is the primary key." if col["primary_key"] else ""
            null_text = " This field is required."  if not col["nullable"] else ""
            col_doc = (
                f"Column {col['name']} in table {table_name} "
                f"has type {col['type']}.{pk_text}{null_text}"
            )
            documents.append(col_doc)
            metadatas.append({"type": "column", "table": table_name, "column": col["name"]})

        for fk in table_info.get("foreign_keys", []):
            fk_doc = (
                f"Table {table_name} column {fk['column']} "
                f"references {fk['references_table']}.{fk['references_column']}. "
                f"Join {table_name} with {fk['references_table']} using this relationship."
            )
            documents.append(fk_doc)
            metadatas.append({"type": "relationship", "table": table_name})

        if table_info.get("sample_rows"):
            sample_text = f"Sample data from {table_name}: "
            for row in table_info["sample_rows"][:2]:
                sample_text += str(row) + " | "
            documents.append(sample_text)
            metadatas.append({"type": "sample", "table": table_name})

    return documents, metadatas


async def ingest_schema(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
) -> dict:
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}

    try:
        config  = {"db_type": conn.db_type, "host": conn.host, "port": conn.port,
                   "database": conn.database, "username": conn.username, "password": conn.password or ""}
        handler = get_handler(conn.db_type, config)
        schema  = handler.get_schema()
        handler.dispose()

        documents, metadatas = _schema_to_documents(schema)
        if not documents:
            return {"success": False, "error": "No schema found to ingest"}

        collection_name = _collection_name(connection_id)
        delete_collection(collection_name)

        result = add_documents(
            collection_name=collection_name,
            documents=documents,
            metadatas=metadatas,
        )

        return {
            "success":   True,
            "connection": conn.name,
            "tables":    len(schema),
            "documents": result.get("added", 0),
            "message":   f"Ingested {result.get('added', 0)} documents from {len(schema)} tables",
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


async def search_knowledge_base(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
    query: str,
    n_results: int = 5,
) -> dict:
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}

    collection_name = _collection_name(connection_id)
    result = search_documents(collection_name, query, n_results=n_results)

    return {
        "success":    result["success"],
        "query":      query,
        "connection": conn.name,
        "results":    result.get("results", []),
        "error":      result.get("error"),
    }


async def get_kb_status(
    db: AsyncSession,
    connection_id: int,
    user_id: int,
) -> dict:
    conn = await get_connection_by_id(db, connection_id, user_id)
    if not conn:
        return {"success": False, "error": "Connection not found"}

    collection_name = _collection_name(connection_id)
    info = get_collection_info(collection_name)

    return {
        "success":          info["success"],
        "connection_id":    connection_id,
        "connection_name":  conn.name,
        "document_count":   info.get("document_count", 0),
        "is_ready":         info.get("document_count", 0) > 0,
    }
