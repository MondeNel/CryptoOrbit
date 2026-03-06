from datetime import datetime
from pydantic import BaseModel

class PlaceBetRequest(BaseModel):
    symbol: str
    direction: str   # "up" | "down"
    stake: float
    entry_price: float

class ResolveBetRequest(BaseModel):
    bet_id: int
    exit_price: float
    round_results: str   # "win,win,lose"

class BetOut(BaseModel):
    id: int
    symbol: str
    direction: str
    stake: float
    entry_price: float
    exit_price: float | None
    payout: float | None
    won: bool | None
    round_results: str
    created_at: datetime
    resolved_at: datetime | None

    model_config = {"from_attributes": True}

class TransactionOut(BaseModel):
    id: int
    type: str
    amount: float
    balance_after: float
    symbol: str
    description: str
    created_at: datetime

    model_config = {"from_attributes": True}