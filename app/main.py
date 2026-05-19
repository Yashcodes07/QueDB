from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.security import get_current_user
from app.db.session import engine, Base
from app.api.routes import auth, connections, query
from app.schemas.schemas import UserOut


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(
    title=settings.APP_NAME,
    description="QueDB - AI powered database query engine",
    version="0.3.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router,        prefix="/api")
app.include_router(connections.router, prefix="/api")
app.include_router(query.router,       prefix="/api")


@app.get("/")
async def root():
    return {"message": f"{settings.APP_NAME} is running"}


@app.get("/api/auth/me", response_model=UserOut, tags=["Auth"])
async def me(current_user=Depends(get_current_user)):
    return current_user
