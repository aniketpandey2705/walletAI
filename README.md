# WalletDNA

> AI-powered bank statement analyzer. Upload a PDF → get spending insights.

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
├── frontend/     # Next.js 14 app
├── backend/      # FastAPI app
├── infra/        # Docker Compose (local Redis)
├── .env.example  # Copy to .env and fill values
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
cp .env.example .env
# Fill in your .env values
```

### 2. Start local Redis

```bash
cd infra
docker-compose up -d
```

### 3. Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 4. Run Celery worker

```bash
# In a separate terminal (with .venv active)
cd backend
celery -A workers.celery_app worker --loglevel=info
```

### 5. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:3000  
Backend API docs: http://localhost:8000/docs

---

## Environment Variables

See [`.env.example`](.env.example) for all required variables.

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `DATABASE_URL` | Supabase PostgreSQL connection string |
| `GROQ_API_KEY` | From console.groq.com |
| `CLERK_SECRET_KEY` | From Clerk dashboard |
| `REDIS_URL` | Local: `redis://localhost:6379/0` |

---

## Supported Banks (MVP)

- ✅ Fino Payments Bank
- 🔜 HDFC Bank
- 🔜 ICICI Bank
- 🔜 SBI

---

## Git Commit Convention

```
feat:    New feature
fix:     Bug fix
chore:   Setup, config, tooling
docs:    Documentation
refactor: Code restructure
```
