# app/main.py  (UPDATED for Week 4 — adds knowledge router)
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import engine, Base
from app.api.routes import auth, connections, query, knowledge   # knowledge is NEW
from app.schemas.schemas import UserOut


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="QueDB - AI powered database query engine",
    version="0.4.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api")
app.include_router(connections.router, prefix="/api")
app.include_router(query.router,       prefix="/api")
app.include_router(knowledge.router,   prefix="/api")   # NEW


@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} v4 is running"}


@app.get("/api/auth/me", response_model=UserOut, tags=["Auth"])
async def me(current_user=Depends(get_current_user)):
    return current_user