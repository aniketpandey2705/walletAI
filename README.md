# WalletDNA 🧬

> AI-powered bank statement analyzer. Upload a PDF → get spending insights.
> Currently supports: **Fino Payments Bank**

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14, TypeScript, Tailwind CSS |
| Backend | FastAPI, Python 3.12 |
| PDF Parsing | Docling + pikepdf (password unlock) |
| AI | Groq API (llama-3.3-70b) |
| Database | PostgreSQL via Supabase |
| File Storage | Supabase Storage |
| Job Queue | Celery + Redis |
| Auth | Clerk |

---

## Project Structure

```
walletdna/
├── frontend/               # Next.js 14 app
├── backend/
│   ├── api/                # FastAPI routers & middleware
│   ├── pipeline/           # 4-stage PDF processing pipeline
│   ├── adapters/           # Bank adapter plugins (fino.py, ...)
│   ├── models/             # SQLAlchemy ORM models (7 tables)
│   ├── schemas/            # Pydantic request/response schemas
│   ├── services/           # Business logic (groq, storage, dedup)
│   ├── workers/            # Celery async tasks
│   ├── db/
│   │   ├── database.py     # Async SQLAlchemy engine
│   │   ├── seed.py         # Seeds 27 categories
│   │   └── migrations/     # Alembic migration history
│   ├── prompts/            # Groq system prompts (versioned)
│   ├── config.py           # Pydantic Settings (reads .env)
│   ├── main.py             # FastAPI entrypoint
│   ├── alembic.ini         # Alembic config
│   └── requirements.txt
├── infra/
│   └── docker-compose.yml  # Local Redis
├── .env.example            # Copy to backend/.env and fill values
└── README.md
```

---

## Local Setup

### Prerequisites
- Node.js 18+
- Python 3.12+
- Docker Desktop (for local Redis)

### 1. Clone and configure

```bash
git clone https://github.com/your-username/walletdna.git
cd walletdna

# Create your .env inside the backend folder
cp .env.example backend/.env
# Open backend/.env and fill in all values
```

### 2. Start local Redis

```bash
cd infra
docker-compose up -d
```

### 3. Backend — install deps & run migrations

```bash
cd backend

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate          # Windows
# source .venv/bin/activate     # Mac/Linux

# Install dependencies
pip install -r requirements.txt
pip install psycopg2-binary     # Alembic sync driver

# Run database migrations (creates all tables in Supabase)
alembic upgrade head

# Seed categories (runs once)
python db/seed.py

# Start API server
uvicorn main:app --reload --port 8000
```

### 4. Run Celery worker

```bash
# In a separate terminal (with .venv active, inside backend/)
celery -A workers.celery_app worker --loglevel=info
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:8000 |
| API Docs (Swagger) | http://localhost:8000/docs |

---

## Environment Variables

Place your `.env` file inside the `backend/` folder. See [`.env.example`](.env.example) for all keys.

| Variable | Where to get it |
|---|---|
| `SUPABASE_URL` | Supabase → Project Settings → API |
| `SUPABASE_ANON_KEY` | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Project Settings → API |
| `DATABASE_URL` | Supabase → Project Settings → Database → URI (Transaction pooler) |
| `GROQ_API_KEY` | [console.groq.com](https://console.groq.com) |
| `CLERK_SECRET_KEY` | Clerk Dashboard → API Keys |
| `CLERK_PUBLISHABLE_KEY` | Clerk Dashboard → API Keys |
| `REDIS_URL` | Local dev: `redis://localhost:6379/0` |

> ⚠️ `DATABASE_URL` format: `postgresql+asyncpg://postgres:PASSWORD@db.YOUR_REF.supabase.co:5432/postgres`

---

## Database

7 tables managed by Alembic migrations:

| Table | Purpose |
|---|---|
| `users` | User accounts (mirrored from Clerk) |
| `statements` | Uploaded bank statement files |
| `transactions` | Normalized financial transactions |
| `categories` | Hierarchical spending categories (27 seeded) |
| `merchant_mapping` | Raw narration → clean merchant name |
| `ai_insights` | Groq-generated spending insights |
| `chat_history` | Future: conversational AI (reserved) |

### Migration commands

```bash
# Apply all pending migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "description"

# Roll back one migration
alembic downgrade -1
```

---

## Supported Banks

| Bank | Status |
|---|---|
| Fino Payments Bank | 🔜 In progress |
| HDFC Bank | 📋 Planned |
| ICICI Bank | 📋 Planned |
| SBI | 📋 Planned |

---

## Build Progress

- [x] Checkpoint 1 — Project scaffolding
- [x] Checkpoint 2 — Database schema + migrations
- [ ] Checkpoint 3 — FastAPI backend routes
- [ ] Checkpoint 4 — Next.js frontend skeleton
- [ ] Checkpoint 5 — PDF pipeline (Fino Bank)
- [ ] Checkpoint 6 — Dashboard UI

---

## Git Commit Convention

```
feat:     New feature
fix:      Bug fix
chore:    Setup, config, tooling
docs:     Documentation only
refactor: Code restructure, no feature change
```
