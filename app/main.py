# app/main.py  (UPDATED for Week 2 — add query router)
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import engine, Base
from app.api.routes import auth, connections, query     # <-- query is NEW
from app.schemas.schemas import UserOut


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="MindsDB-like AI database queray engine",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,        prefix="/api")
app.include_router(connections.router, prefix="/api")
app.include_router(query.router,       prefix="/api")   # <-- NEW


@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} v2 is running"}


@app.get("/api/auth/me", response_model=UserOut, tags=["Auth"])
async def me(current_user=Depends(get_current_user)):
    return current_user