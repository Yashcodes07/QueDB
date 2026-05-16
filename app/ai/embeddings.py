# app/ai/embeddings.py
# ─────────────────────────────────────────────────────────────────────────────
# WHAT ARE EMBEDDINGS?
# Embeddings convert text into a list of numbers (a vector).
# Similar meaning = similar numbers = close together in vector space.
#
# Example:
# "Show me all users" → [0.12, 0.85, 0.34, ...]
# "List every user"   → [0.13, 0.84, 0.35, ...]  ← very similar!
# "What is the weather?" → [0.91, 0.02, 0.67, ...] ← very different
#
# We use this for semantic search — find content by MEANING not exact words.
# Library: sentence-transformers (runs locally, completely free, no API key)
# ─────────────────────────────────────────────────────────────────────────────

from sentence_transformers import SentenceTransformer
import numpy as np

# Load model once at module level (not on every call — expensive to load)
# all-MiniLM-L6-v2 is small (22MB), fast, and very good for semantic search
_model = None


def get_model() -> SentenceTransformer:
    """
    Lazy load the embedding model.
    First call downloads it (~22MB), subsequent calls use cached version.
    """
    global _model
    if _model is None:
        print("Loading embedding model (first time only)...")
        _model = SentenceTransformer("all-MiniLM-L6-v2")
        print("Embedding model loaded!")
    return _model


def embed_text(text: str) -> list[float]:
    """
    Convert a single string to a vector (list of 384 floats).

    Example:
        vector = embed_text("How many users are there?")
        # Returns [0.12, -0.45, 0.89, ...] (384 numbers)
    """
    model = get_model()
    vector = model.encode(text, convert_to_numpy=True)
    return vector.tolist()


def embed_texts(texts: list[str]) -> list[list[float]]:
    """
    Convert a list of strings to vectors (batch — faster than one by one).

    Example:
        vectors = embed_texts(["Query 1", "Query 2", "Query 3"])
        # Returns [[...], [...], [...]]
    """
    model = get_model()
    vectors = model.encode(texts, convert_to_numpy=True, batch_size=32)
    return vectors.tolist()


def cosine_similarity(vec1: list[float], vec2: list[float]) -> float:
    """
    Measures how similar two vectors are.
    Returns a value from 0.0 (completely different) to 1.0 (identical).

    Used to rank search results by relevance.
    """
    a = np.array(vec1)
    b = np.array(vec2)
    return float(np.dot(a, b) / (np.linalg.norm(a) * np.linalg.norm(b)))