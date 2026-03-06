from datetime import date, timedelta
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import (
    hash_password, verify_password,
    create_access_token, create_refresh_token, decode_token,
    get_current_user,
)
from app.models.user import User
from app.models.bet import Transaction
from app.schemas.auth import UserRegister, UserLogin, TokenResponse, RefreshRequest, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])

WELCOME_BONUS = 10.0

def _today() -> str:
    return date.today().isoformat()

def _update_login_streak(user: User) -> None:
    today = _today()
    yesterday = (date.today() - timedelta(days=1)).isoformat()
    if user.last_login_date == today:
        return
    if user.last_login_date == yesterday:
        user.login_streak += 1
    else:
        user.login_streak = 1
    user.last_login_date = today


@router.post("/register", response_model=TokenResponse, status_code=201)
def register(body: UserRegister, db: Session = Depends(get_db)):
    if db.query(User).filter(User.username == body.username).first():
        raise HTTPException(400, "Username already taken")
    if db.query(User).filter(User.email == body.email).first():
        raise HTTPException(400, "Email already registered")

    user = User(
        username=body.username,
        email=body.email,
        hashed_password=hash_password(body.password),
        account_balance=WELCOME_BONUS,
        current_balance=WELCOME_BONUS,
        last_login_date=_today(),
    )
    db.add(user)
    db.flush()

    tx = Transaction(
        user_id=user.id,
        type="free",
        amount=WELCOME_BONUS,
        balance_after=WELCOME_BONUS,
        description="Welcome bonus",
    )
    db.add(tx)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/login", response_model=TokenResponse)
def login(body: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == body.username).first()
    if not user or not verify_password(body.password, user.hashed_password):
        raise HTTPException(401, "Invalid credentials")

    _update_login_streak(user)
    db.commit()

    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh(body: RefreshRequest, db: Session = Depends(get_db)):
    payload = decode_token(body.refresh_token)
    if payload.get("type") != "refresh":
        raise HTTPException(401, "Invalid token type")
    user = db.get(User, int(payload["sub"]))
    if not user or not user.is_active:
        raise HTTPException(401, "User not found")
    return TokenResponse(
        access_token=create_access_token(user.id),
        refresh_token=create_refresh_token(user.id),
    )


@router.get("/me", response_model=UserOut)
def me(user: User = Depends(get_current_user)):
    return user


@router.post("/logout", status_code=204)
def logout():
    # stateless — client discards tokens
    return