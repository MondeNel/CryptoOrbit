# OrbitBet 🪐

> **Predict · Orbit · Win**  
> A real-time price prediction platform built for engagement, habit formation, and repeat play.

---

## Table of Contents

- [What is OrbitBet?](#what-is-orbitbet)
- [How It Works](#how-it-works)
- [Gamification Design](#gamification-design)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Running the Backend](#running-the-backend)
- [Running the Frontend](#running-the-frontend)
- [Running with Docker](#running-with-docker)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Database Schema](#database-schema)
- [Gamification System](#gamification-system)
- [Roadmap](#roadmap)

---

## What is OrbitBet?

OrbitBet is a mobile-first, real-time price prediction app. Players watch live market prices tick
across crypto and forex pairs, then call whether the next move will go **UP** or **DOWN**.

Each prediction plays out over **3 rounds**. Win 2 of 3 and the payout is yours at **1.85×** your
stake. The experience is designed around a slot-machine aesthetic — spinning digit reels, an
orbiting planet that tracks each round, and a layered sound engine — combined with a full
gamification system to drive daily return and long-term retention.

The platform is a **mockup / demo** built with real production architecture: FastAPI backend,
React frontend, PostgreSQL database, JWT authentication, and a full test suite.

---

## How It Works

### 1. Register or Log In
Create an account and receive a **R10 free welcome bonus** credited automatically.
Every returning login updates your **login streak** — come back daily to keep it alive.

### 2. Pick a Market
Choose from:
- **Crypto** — BTC/USD, ETH/USD
- **Forex**  — USD/EUR, USD/ZAR

### 3. Watch the Live Price
The ticker displays the current simulated price using an animated slot-machine reel.
Each digit spins independently with a cascading left-to-right effect and layered
mechanical sound design.

### 4. Set Your Stake
Use the stake editor to choose how much to bet. Minimum R10, maximum R10,000.
Your current spendable balance is always visible in the header.

### 5. Call UP or DOWN
Tap the **▲ UP** or **▼ DOWN** button. Your stake is held immediately.

### 6. The Orbit Plays Out
Three rounds resolve one by one, tracked by the **Probability Orbit**:
- The planet starts at the outer ring and moves inward each round.
- Win a round → planet glows green.
- Lose a round → planet glows red.
- A near-miss (1–1 going into round 3) triggers an amber flash and screen shake.
- Win 2 of 3 → orbit core lights up green, fanfare plays, payout credited.
- Lose 2 of 3 → orbit core turns red, loss sound plays, stake is lost.

### 7. Wallet
Deposit and withdraw funds from the Wallet screen using the numpad modal.
Every transaction is recorded in an append-only ledger viewable in transaction history.

---

## Gamification Design

OrbitBet is built around proven behavioural psychology and habit-forming design patterns.

### Win Streak
Every consecutive win increments your streak counter. The streak bar shows:
- Current streak count with colour-coded heat (gold → orange → red as streak grows).
- A fire emoji that pops and animates on each win.
- The last 5 results as coloured pip dots.
- Your all-time personal best streak.

Milestone banners fire at streaks of 3, 5, and 10 to reward and encourage continuation.

### Variable-Ratio Reinforcement
The 3-round structure is a deliberate variable-ratio schedule — the same reinforcement
pattern behind slot machines and social media feeds. The player never knows exactly when
they will win, which produces the highest rate of repeated engagement of any schedule type.

### Near-Miss Effect
When a bet goes 1–1 into round 3, the UI deliberately amplifies tension:
- Amber flash instead of red on the round dot.
- Screen shake animation on the orbit.
- A dissonant descending near-miss tone.
This near-miss effect is a documented mechanism that sustains engagement even in losing runs.

### XP and Levelling
Every resolved bet awards XP:
- **Win**  → 50 XP base + up to 100 bonus XP scaled by current streak length.
- **Loss** → 10 XP participation reward (no-zero policy keeps players progressing).

Level = `xp // 500 + 1`. Level progress is displayed in the Profile screen with an XP bar.

### Login Streak
Logging in on consecutive days increments the login streak counter.
Missing a day resets it to 1. This Duolingo-style mechanic creates a daily return habit
by leveraging loss aversion — players return to protect their streak, not just to win.

### Daily Bets Counter
The backend tracks how many bets a player has placed today. This feeds future features
like daily challenges, bonus XP for first bet of the day, and daily goal notifications.

### Onboarding
A multi-step spotlight tutorial walks new players through:
1. The live price ticker.
2. The UP / DOWN buttons.
3. The orbit and 3-round system.
4. The stake editor.
Each step uses a ghost-tap animation and a focused spotlight overlay to direct attention.

---

## Tech Stack

### Backend
| Layer        | Technology                          | Purpose                                      |
|--------------|-------------------------------------|----------------------------------------------|
| Framework    | **FastAPI** 0.115                   | Async REST API, OpenAPI docs auto-generated  |
| Server       | **Uvicorn** (ASGI)                  | Production-grade async server                |
| ORM          | **SQLAlchemy** 2.0                  | Database models and query building           |
| Migrations   | **Alembic**                         | Schema version control (production use)      |
| Database     | **PostgreSQL 16**                   | Primary data store (Docker container)        |
| Auth         | **python-jose** + **passlib/bcrypt**| JWT token creation/validation, password hash |
| Validation   | **Pydantic v2** + pydantic-settings | Request/response schemas, env config         |
| Testing      | **pytest** + **httpx** + SQLite     | Full test suite, in-memory DB per test       |

### Frontend
| Layer        | Technology                          | Purpose                                      |
|--------------|-------------------------------------|----------------------------------------------|
| Framework    | **React 18**                        | Component-based UI                           |
| Build tool   | **Vite**                            | Fast dev server with HMR, /api proxy         |
| Routing      | **React Router v6**                 | Client-side navigation                       |
| State        | **Zustand**                         | Lightweight global store (auth + game state) |
| HTTP         | **Axios**                           | API calls with auto token-refresh interceptor|
| Styling      | Custom CSS (CSS variables)          | Dark space aesthetic, gold accents           |
| Fonts        | Share Tech Mono + Rajdhani          | Sci-fi / HUD character                       |
| Audio        | **Web Audio API**                   | Procedural sound engine (no audio files)     |

### Infrastructure
| Layer        | Technology                          | Purpose                                      |
|--------------|-------------------------------------|----------------------------------------------|
| Containers   | **Docker** + **Docker Compose**     | One-command local stack                      |
| Database     | **PostgreSQL 16-alpine**            | Containerised with health check              |
| Auth tokens  | **JWT** (access + refresh)          | Stateless authentication                     |
| CORS         | FastAPI CORSMiddleware              | Controlled cross-origin access               |

---

## Project Structure
```
orbitbet/
├── docker-compose.yml          # Full stack orchestration
├── docker/
│   └── init.sql                # PostgreSQL init (uuid-ossp extension)
├── .env.example                # Environment variable template
│
├── backend/
│   ├── Dockerfile
│   ├── requirements.txt
│   └── app/
│       ├── main.py             # FastAPI app, CORS, router mounts
│       ├── core/
│       │   ├── config.py       # Settings (pydantic-settings)
│       │   ├── database.py     # Engine, SessionLocal, Base, get_db
│       │   └── security.py     # JWT utils, password hashing, get_current_user
│       ├── models/
│       │   ├── user.py         # User ORM model
│       │   └── bet.py          # Bet + Transaction ORM models
│       ├── schemas/
│       │   ├── auth.py         # UserRegister, UserLogin, TokenResponse, UserOut
│       │   └── bet.py          # PlaceBetRequest, ResolveBetRequest, BetOut, TransactionOut
│       ├── api/
│       │   ├── auth.py         # /auth router
│       │   ├── bets.py         # /bets router
│       │   └── wallet.py       # /wallet router
│       └── tests/
│           ├── conftest.py     # SQLite fixtures: db, client, test_user, auth_headers
│           ├── test_auth.py    # 22 auth tests
│           ├── test_bets.py    # 15 bet tests
│           └── test_wallet.py  # 12 wallet tests
│
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx            # React entry point
        ├── App.jsx             # Router + protected route wrapper
        ├── services/
        │   └── api.js          # Axios instance with refresh interceptor
        ├── store/
        │   └── useStore.js     # Zustand store (auth, game, UI slices)
        ├── components/
        │   ├── layout/
        │   │   └── AppShell.jsx        # Bottom nav + screen switcher
        │   └── trade/
        │       ├── Ticker.jsx          # Slot-machine digit reels
        │       ├── OrbitAnimation.jsx  # Planet orbit, round tracking
        │       ├── StreakBar.jsx        # Streak, pips, best streak
        │       └── BetControls.jsx     # Stake editor, UP/DOWN buttons
        └── pages/
            ├── LoginPage.jsx
            ├── RegisterPage.jsx
            ├── TradePage.jsx
            ├── WalletPage.jsx
            ├── HistoryPage.jsx
            └── ProfilePage.jsx
```

---

## Getting Started

### Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running
- Or alternatively: Python 3.12+, Node.js 18+, and a local PostgreSQL instance

---

## Environment Variables

Copy `.env.example` to `.env` and update the values:
```bash
cp .env.example .env
```

| Variable                      | Default                                          | Description                        |
|-------------------------------|--------------------------------------------------|------------------------------------|
| `DATABASE_URL`                | `postgresql://orbitbet:...@localhost:5432/orbitbet` | PostgreSQL connection string    |
| `SECRET_KEY`                  | `change-me-...`                                  | JWT signing secret. Change in prod |
| `ALGORITHM`                   | `HS256`                                          | JWT algorithm                      |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `60`                                             | Access token lifetime in minutes   |
| `REFRESH_TOKEN_EXPIRE_DAYS`   | `30`                                             | Refresh token lifetime in days     |
| `CORS_ORIGINS`                | `http://localhost:3000,http://localhost:5173`    | Comma-separated allowed origins    |
| `VITE_API_URL`                | `http://localhost:8000`                          | Backend URL used by the frontend   |

---

## Running the Backend
```bash
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (Docker only)
docker run -d \
  --name orbitbet_db \
  -e POSTGRES_USER=orbitbet \
  -e POSTGRES_PASSWORD=orbitbet_secret \
  -e POSTGRES_DB=orbitbet \
  -p 5432:5432 \
  postgres:16-alpine

# Start the API server
uvicorn app.main:app --reload
```

API is available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

---

## Running the Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start the dev server
npm run dev
```

Frontend is available at `http://localhost:5173`

---

## Running with Docker

The easiest way to run the full stack:
```bash
# Copy env file
cp .env.example .env

# Start everything
docker compose up --build

# Stop everything
docker compose down

# Stop and remove all data
docker compose down -v
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:3000        |
| Backend  | http://localhost:8000        |
| API Docs | http://localhost:8000/docs   |
| Database | localhost:5432               |

---

## Running Tests

Tests use an **SQLite in-memory database** so no Docker or PostgreSQL is needed.
```bash
cd backend

# Install dependencies if not already done
pip install -r requirements.txt

# Run all tests
pytest

# Run with verbose output
pytest -v

# Run a specific test file
pytest app/tests/test_auth.py -v

# Run a specific test class
pytest app/tests/test_bets.py::TestResolveBetWin -v

# Run with coverage report
pytest --cov=app --cov-report=term-missing
```

### Test Coverage Summary

| File             | Tests | What is covered                                              |
|------------------|-------|--------------------------------------------------------------|
| `test_auth.py`   | 22    | Register, login, login streak, refresh, /me, logout, balance seeding |
| `test_bets.py`   | 15    | Place, resolve win/loss, XP, streak, best_streak, ownership, history |
| `test_wallet.py` | 12    | Deposit, withdraw, balance rules, ledger ordering, user isolation |
| **Total**        | **49**|                                                              |

---

## API Reference

### Auth — `/auth`

| Method | Path              | Auth | Description                              |
|--------|-------------------|------|------------------------------------------|
| POST   | `/auth/register`  | ✗    | Create account, returns token pair       |
| POST   | `/auth/login`     | ✗    | Login, updates login streak, returns tokens |
| POST   | `/auth/refresh`   | ✗    | Exchange refresh token for new pair      |
| GET    | `/auth/me`        | ✓    | Return user profile + gamification state |
| POST   | `/auth/logout`    | ✗    | Stateless — client discards tokens       |

### Bets — `/bets`

| Method | Path              | Auth | Description                              |
|--------|-------------------|------|------------------------------------------|
| POST   | `/bets/place`     | ✓    | Open a bet, deduct stake                 |
| POST   | `/bets/resolve`   | ✓    | Close a bet, award payout, update XP     |
| GET    | `/bets/history`   | ✓    | Paginated resolved bet history           |

### Wallet — `/wallet`

| Method | Path                    | Auth | Description                        |
|--------|-------------------------|------|------------------------------------|
| POST   | `/wallet/deposit`       | ✓    | Add funds to wallet                |
| POST   | `/wallet/withdraw`      | ✓    | Remove funds from wallet           |
| GET    | `/wallet/transactions`  | ✓    | Full transaction ledger            |

### System

| Method | Path       | Auth | Description              |
|--------|------------|------|--------------------------|
| GET    | `/health`  | ✗    | Health check for Docker  |

---

## Database Schema

### `users`
| Column            | Type      | Notes                                        |
|-------------------|-----------|----------------------------------------------|
| id                | Integer   | Primary key                                  |
| username          | String    | Unique, indexed                              |
| email             | String    | Unique, indexed                              |
| hashed_password   | String    | bcrypt hash                                  |
| is_active         | Boolean   | Soft-disable accounts without deleting       |
| account_balance   | Float     | Lifetime deposits. Decreases only on withdraw|
| current_balance   | Float     | Spendable funds                              |
| streak            | Integer   | Current consecutive win run                  |
| best_streak       | Integer   | All-time personal record                     |
| total_bets        | Integer   | Lifetime resolved bets                       |
| total_wins        | Integer   | Lifetime wins                                |
| xp                | Integer   | Experience points                            |
| level             | Integer   | xp // 500 + 1                               |
| daily_bets        | Integer   | Bets placed today — resets at midnight       |
| last_bet_date     | String    | ISO date YYYY-MM-DD                          |
| login_streak      | Integer   | Consecutive daily logins                     |
| last_login_date   | String    | ISO date YYYY-MM-DD                          |
| created_at        | DateTime  | Server default                               |
| updated_at        | DateTime  | Auto on update                               |

### `bets`
| Column        | Type     | Notes                                         |
|---------------|----------|-----------------------------------------------|
| id            | Integer  | Primary key                                   |
| user_id       | Integer  | Foreign key → users.id                        |
| symbol        | String   | e.g. BTC/USD                                  |
| direction     | String   | "up" or "down"                                |
| stake         | Float    | R10 minimum, R10,000 maximum                  |
| entry_price   | Float    | Price at bet placement                        |
| exit_price    | Float    | Price at resolution. NULL while in-progress   |
| payout        | Float    | Gross payout on win (stake × 1.85)            |
| won           | Boolean  | NULL = in-progress, True = win, False = loss  |
| round_results | String   | Comma-separated e.g. "win,win,lose"           |
| created_at    | DateTime | Server default                                |
| resolved_at   | DateTime | NULL until resolved                           |

### `transactions`
| Column        | Type     | Notes                                          |
|---------------|----------|------------------------------------------------|
| id            | Integer  | Primary key                                    |
| user_id       | Integer  | Foreign key → users.id                         |
| type          | String   | deposit, withdraw, bet_win, bet_loss, free      |
| amount        | Float    | Positive = credit, negative = debit            |
| balance_after | Float    | Snapshot of current_balance at time of record  |
| symbol        | String   | Market symbol for bet transactions             |
| description   | String   | Human-readable summary                         |
| created_at    | DateTime | Server default                                 |

---

## Gamification System
```
XP Awards
─────────────────────────────────────────────
Win   →  50 XP base
          + min(streak × 5, 100) streak bonus
Loss  →  10 XP participation reward

Level = xp // 500 + 1   (starts at 1)

Streak Milestones
─────────────────────────────────────────────
3  in a row  →  🔥  "3 in a row!" banner
5  in a row  →  💥  "5 streak — unstoppable!" banner
10 in a row  →  🚀  "10 streak — legendary!" banner

Login Streak Logic
─────────────────────────────────────────────
Yesterday's last login  →  streak + 1
Same day again          →  no change
Gap of 2+ days          →  reset to 1
```

---

## Roadmap

- [ ] Leaderboard — top streaks and XP rankings
- [ ] Daily challenges — bonus XP for first bet of the day
- [ ] Push notifications — login streak reminders
- [ ] Real price feed — WebSocket integration (Binance / OANDA)
- [ ] Bet history charts — win/loss ratio over time
- [ ] Referral system — invite friends for bonus credits
- [ ] Admin dashboard — user management, transaction audit
- [ ] Redis token denylist — server-side logout invalidation
- [ ] Alembic migrations — proper schema versioning for production

---

## License

MIT — free to use, modify, and distribute.

---

## Auto-build script
 
```
./run.sh          # build & start everything (default)
./run.sh down     # stop all services
./run.sh restart  # restart without rebuilding
./run.sh logs     # stream all logs
./run.sh logs backend   # stream just backend logs
./run.sh clean    # remove everything including volumes

```

```

cd backend

# Create virtual environment
python -m venv venv

# Activate environment
source venv/bin/activate      # macOS / Linux
venv\Scripts\activate         # Windows

# Install dependencies
pip install -r requirements.txt

# Start PostgreSQL (Docker)
docker run -d 

docker compose ps
- checking if the containers are running

# Start FastAPI server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

```

*Built with 🪐 by OrbitBet Dev*

*Disclaimer: This app was developed with the help of AI(Claude)*