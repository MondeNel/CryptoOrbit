from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.core.database import engine, Base
from app.api import auth, bets, wallet

# create tables (use Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="OrbitBet API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS.split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(bets.router)
app.include_router(wallet.router)

@app.get("/health")
def health():
    return {"status": "ok"}