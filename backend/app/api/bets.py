from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.bet import Bet, Transaction
from app.schemas.bet import PlaceBetRequest, ResolveBetRequest, BetOut

router = APIRouter(prefix="/bets", tags=["bets"])

PAYOUT_MULTIPLIER = 1.85
MIN_STAKE = 10.0
MAX_STAKE = 10_000.0

def _calc_xp(won: bool, streak: int) -> int:
    return 50 + min(streak * 5, 100) if won else 10

def _calc_level(xp: int) -> int:
    return xp // 500 + 1


@router.post("/place", response_model=BetOut, status_code=201)
def place_bet(body: PlaceBetRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if body.stake < MIN_STAKE or body.stake > MAX_STAKE:
        raise HTTPException(400, f"Stake must be between {MIN_STAKE} and {MAX_STAKE}")
    if body.stake > user.current_balance:
        raise HTTPException(400, "Insufficient balance")
    if body.direction not in ("up", "down"):
        raise HTTPException(400, "direction must be 'up' or 'down'")

    user.current_balance = round(user.current_balance - body.stake, 2)

    bet = Bet(
        user_id=user.id,
        symbol=body.symbol,
        direction=body.direction,
        stake=body.stake,
        entry_price=body.entry_price,
    )
    db.add(bet)
    db.commit()
    db.refresh(bet)
    return bet


@router.post("/resolve", response_model=BetOut)
def resolve_bet(body: ResolveBetRequest, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    bet = db.get(Bet, body.bet_id)
    if not bet or bet.user_id != user.id:
        raise HTTPException(404, "Bet not found")
    if bet.won is not None:
        raise HTTPException(400, "Bet already resolved")

    results = [r.strip() for r in body.round_results.split(",")]
    won = results.count("win") >= 2
    payout = round(bet.stake * PAYOUT_MULTIPLIER, 2) if won else 0.0

    bet.exit_price   = body.exit_price
    bet.round_results = body.round_results
    bet.won          = won
    bet.payout       = payout
    bet.resolved_at  = datetime.now(timezone.utc)

    # update user
    if won:
        user.current_balance = round(user.current_balance + payout, 2)
        user.streak     += 1
        user.total_wins += 1
    else:
        user.streak = 0

    user.best_streak = max(user.best_streak, user.streak)
    xp_earned        = _calc_xp(won, user.streak)
    user.xp         += xp_earned
    user.level       = _calc_level(user.xp)
    user.total_bets += 1

    # daily bets
    from datetime import date
    today = date.today().isoformat()
    if user.last_bet_date != today:
        user.daily_bets = 1
    else:
        user.daily_bets += 1
    user.last_bet_date = today

    # ledger
    tx_type = "bet_win" if won else "bet_loss"
    tx_amount = round(payout - bet.stake, 2) if won else -bet.stake
    tx = Transaction(
        user_id=user.id,
        type=tx_type,
        amount=tx_amount,
        balance_after=user.current_balance,
        symbol=bet.symbol,
        description=f"{bet.symbol} {bet.direction.upper()} — {'WIN' if won else 'LOSS'}",
    )
    db.add(tx)
    db.commit()
    db.refresh(bet)
    return bet


@router.get("/history", response_model=list[BetOut])
def bet_history(
    skip: int = 0,
    limit: int = 20,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Bet)
        .filter(Bet.user_id == user.id, Bet.won.isnot(None))
        .order_by(Bet.resolved_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )