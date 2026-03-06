from datetime import datetime
from sqlalchemy import String, Boolean, Float, Integer, DateTime, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id:                 Mapped[int]      = mapped_column(Integer, primary_key=True, index=True)
    username:           Mapped[str]      = mapped_column(String, unique=True, index=True)
    email:              Mapped[str]      = mapped_column(String, unique=True, index=True)
    hashed_password:    Mapped[str]      = mapped_column(String)
    is_active:          Mapped[bool]     = mapped_column(Boolean, default=True)

    # balances
    account_balance:    Mapped[float]    = mapped_column(Float, default=0.0)
    current_balance:    Mapped[float]    = mapped_column(Float, default=0.0)

    # gamification
    streak:             Mapped[int]      = mapped_column(Integer, default=0)
    best_streak:        Mapped[int]      = mapped_column(Integer, default=0)
    total_bets:         Mapped[int]      = mapped_column(Integer, default=0)
    total_wins:         Mapped[int]      = mapped_column(Integer, default=0)
    xp:                 Mapped[int]      = mapped_column(Integer, default=0)
    level:              Mapped[int]      = mapped_column(Integer, default=1)
    daily_bets:         Mapped[int]      = mapped_column(Integer, default=0)
    last_bet_date:      Mapped[str]      = mapped_column(String, default="")
    login_streak:       Mapped[int]      = mapped_column(Integer, default=1)
    last_login_date:    Mapped[str]      = mapped_column(String, default="")

    created_at:         Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at:         Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())