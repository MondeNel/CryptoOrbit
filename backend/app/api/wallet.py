from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_current_user
from app.models.user import User
from app.models.bet import Transaction
from app.schemas.bet import TransactionOut


router = APIRouter(prefix="/wallet", tags=["wallet"])

MIN_DEPOSIT    = 10.0
MAX_DEPOSIT    = 10_000.0
MIN_WITHDRAWAL = 10.0


@router.post("/deposit", response_model=TransactionOut, status_code=201)
def deposit(amount: float, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if amount < MIN_DEPOSIT:
        raise HTTPException(400, f"Minimum deposit is R{MIN_DEPOSIT:.0f}")
    if amount > MAX_DEPOSIT:
        raise HTTPException(400, f"Maximum deposit is R{MAX_DEPOSIT:.0f}")

    user.account_balance = round(user.account_balance + amount, 2)
    user.current_balance = round(user.current_balance + amount, 2)

    tx = Transaction(
        user_id=user.id,
        type="deposit",
        amount=amount,
        balance_after=user.current_balance,
        description=f"Deposit R{amount:.2f}",
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.post("/withdraw", response_model=TransactionOut, status_code=201)
def withdraw(amount: float, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if amount < MIN_WITHDRAWAL:
        raise HTTPException(400, f"Minimum withdrawal is R{MIN_WITHDRAWAL:.0f}")
    if amount > user.current_balance:
        raise HTTPException(400, "Insufficient balance")

    user.account_balance = round(max(0, user.account_balance - amount), 2)
    user.current_balance = round(user.current_balance - amount, 2)

    tx = Transaction(
        user_id=user.id,
        type="withdraw",
        amount=-amount,
        balance_after=user.current_balance,
        description=f"Withdrawal R{amount:.2f}",
    )
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.get("/transactions", response_model=list[TransactionOut])
def transactions(
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    return (
        db.query(Transaction)
        .filter(Transaction.user_id == user.id)
        .order_by(Transaction.id.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )