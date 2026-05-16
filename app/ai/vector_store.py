# app/ai/vector_store.py
# ─────────────────────────────────────────────────────────────────────────────
# WHAT IS A VECTOR STORE?
# A vector store is a database that stores embeddings (vectors).
# Instead of searching by exact match, it searches by SIMILARITY.
#
# We use ChromaDB — it stores vectors on disk, persists between restarts,
# and has a simple Python API.
#
# Collections in ChromaDB = tables in PostgreSQL
# Each collection stores: text + its embedding + metadata
# ─────────────────────────────────────────────────────────────────────────────

import chromadb
from chromadb.config import Settings
from app.ai.embeddings import embed_text, embed_texts
import os


# ChromaDB stores data here — persists between restarts
CHROMA_PATH = os.getenv("CHROMA_PATH", "./chroma_db")


def get_chroma_client() -> chromadb.Client:
    """
    Returns a persistent ChromaDB client.
    Data is saved to disk at CHROMA_PATH so it survives server restarts.
    """
    return chromadb.PersistentClient(path=CHROMA_PATH)


def get_or_create_collection(collection_name: str):
    """
    Gets an existing collection or creates a new one.
    Think of it like: get_or_create_table("my_table")

    collection_name convention: "kb_{connection_id}"
    Example: "kb_1" for connection ID 1
    """
    client = get_chroma_client()
    return client.get_or_create_collection(
        name=collection_name,
        metadata={"hnsw:space": "cosine"}   # use cosine similarity for search
    )


def add_documents(
    collection_name: str,
    documents: list[str],
    metadatas: list[dict] = None,
    ids: list[str] = None,
) -> dict:
    """
    Adds text documents to ChromaDB with their embeddings.

    documents  = list of text strings to store
    metadatas  = optional list of dicts with extra info per document
                 e.g. {"source": "schema", "table": "users"}
    ids        = unique string IDs for each document

    Flow:
    1. Generate embeddings for all documents (batch)
    2. Store text + embedding + metadata in ChromaDB
    """
    if not documents:
        return {"success": False, "error": "No documents provided"}

    try:
        collection = get_or_create_collection(collection_name)

        # Generate IDs if not provided
        if ids is None:
            existing = collection.count()
            ids = [f"doc_{existing + i}" for i in range(len(documents))]

        # Generate embeddings for all documents at once (batch = faster)
        embeddings = embed_texts(documents)

        # Default metadata if not provided
        if metadatas is None:
            metadatas = [{"source": "manual"}] * len(documents)

        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids,
        )

        return {
            "success": True,
            "added": len(documents),
            "collection": collection_name,
        }

    except Exception as e:
        return {"success": False, "error": str(e)}


def search_documents(
    collection_name: str,
    query: str,
    n_results: int = 5,
    where: dict = None,
) -> dict:
    """
    Searches ChromaDB for documents similar to the query.

    query     = plain English search query
    n_results = how many results to return (default 5)
    where     = optional metadata filter e.g. {"table": "users"}

    Flow:
    1. Embed the query into a vector
    2. ChromaDB finds the n_results most similar vectors
    3. Return the matching documents with similarity scores
    """
    try:
        collection = get_or_create_collection(collection_name)

        if collection.count() == 0:
            return {"success": True, "results": [], "message": "Collection is empty"}

        query_embedding = embed_text(query)

        search_params = {
            "query_embeddings": [query_embedding],
            "n_results": min(n_results, collection.count()),
            "include": ["documents", "metadatas", "distances"],
        }
        if where:
            search_params["where"] = where

        results = collection.query(**search_params)

        # Format results — convert distance to similarity score
        # ChromaDB cosine distance: 0 = identical, 2 = opposite
        # We convert to similarity: 1 = identical, 0 = opposite
        formatted = []
        for i, doc in enumerate(results["documents"][0]):
            distance = results["distances"][0][i]
            similarity = round(1 - (distance / 2), 4)
            formatted.append({
                "text":       doc,
                "metadata":   results["metadatas"][0][i],
                "similarity": similarity,
            })

        return {"success": True, "results": formatted}

    except Exception as e:
        return {"success": False, "error": str(e), "results": []}


def delete_collection(collection_name: str) -> dict:
    """Delete an entire collection (e.g. when user removes a connection)."""
    try:
        client = get_chroma_client()
        client.delete_collection(collection_name)
        return {"success": True}
    except Exception as e:
        return {"success": False, "error": str(e)}


def get_collection_info(collection_name: str) -> dict:
    """Returns info about a collection: document count, etc."""
    try:
        collection = get_or_create_collection(collection_name)
        return {
            "success": True,
            "collection": collection_name,
            "document_count": collection.count(),
        }
    except Exception as e:
        return {"success": False, "error": str(e)}