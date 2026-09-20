# MediDiet-AI

A new, from-scratch medical nutrition platform with a separated frontend and backend.

## Stack

- Frontend: React + TypeScript + Vite
- Backend: Python + FastAPI
- Database: PostgreSQL
- ORM: SQLAlchemy
- Migrations: Alembic
- Local AI: Ollama + Gemma
- API: REST/JSON

## Project layout

```text
MediDiet-AI/
├── frontend/
├── backend/
├── docs/
└── docker-compose.yml
```

## Start PostgreSQL

```bash
docker compose up -d db
```

## Start backend

```bash
cd backend
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

pip install -r requirements.txt
cp .env.example .env
uvicorn app.main:app --reload
```

API docs: http://localhost:8000/docs

## Start Ollama

Install Ollama, then:

```bash
ollama pull gemma3
```

## Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend: http://localhost:5173
