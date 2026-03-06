from datetime import datetime
from sqlalchemy import String, Float, Integer, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base

class Bet(Base):
    __tablename__ = "bets"

    id:             Mapped[int]            = mapped_column(Integer, primary_key=True, index=True)
    user_id:        Mapped[int]            = mapped_column(Integer, ForeignKey("users.id"))
    symbol:         Mapped[str]            = mapped_column(String)
    direction:      Mapped[str]            = mapped_column(String)        # "up" | "down"
    stake:          Mapped[float]          = mapped_column(Float)
    entry_price:    Mapped[float]          = mapped_column(Float)
    exit_price:     Mapped[float | None]   = mapped_column(Float, nullable=True)
    payout:         Mapped[float | None]   = mapped_column(Float, nullable=True)
    won:            Mapped[bool | None]    = mapped_column(Boolean, nullable=True)
    round_results:  Mapped[str]            = mapped_column(String, default="")  # "win,win,lose"
    created_at:     Mapped[datetime]       = mapped_column(DateTime, server_default=func.now())
    resolved_at:    Mapped[datetime | None]= mapped_column(DateTime, nullable=True)


class Transaction(Base):
    __tablename__ = "transactions"

    id:             Mapped[int]           = mapped_column(Integer, primary_key=True, index=True)
    user_id:        Mapped[int]           = mapped_column(Integer, ForeignKey("users.id"))
    type:           Mapped[str]           = mapped_column(String)   # deposit|withdraw|bet_win|bet_loss|free
    amount:         Mapped[float]         = mapped_column(Float)    # positive = credit, negative = debit
    balance_after:  Mapped[float]         = mapped_column(Float)
    symbol:         Mapped[str]           = mapped_column(String, default="")
    description:    Mapped[str]           = mapped_column(String, default="")
    created_at:     Mapped[datetime]      = mapped_column(DateTime, server_default=func.now())