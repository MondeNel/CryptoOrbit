from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"

class RefreshRequest(BaseModel):
    refresh_token: str

class UserOut(BaseModel):
    id: int
    username: str
    email: str
    account_balance: float
    current_balance: float
    streak: int
    best_streak: int
    total_bets: int
    total_wins: int
    xp: int
    level: int
    daily_bets: int
    login_streak: int

    model_config = {"from_attributes": True}