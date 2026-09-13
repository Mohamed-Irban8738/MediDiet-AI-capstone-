from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from app.api.doctors import router as doctors_router
from app.api.auth import router as auth_router
from app.api.test_auth import router as test_auth_router
from app.api.patients import router as patients_router
from app.api.consultations import router as consultations_router
from app.core.config import settings
from app.database.session import engine


app = FastAPI(
    title="MediDiet-AI API",
    version="0.1.0",
    description="Backend API for MediDiet-AI",
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# API Routers
# --------------------------------------------------

app.include_router(auth_router)
app.include_router(test_auth_router)
app.include_router(patients_router)
app.include_router(doctors_router)
app.include_router(consultations_router)
# --------------------------------------------------
# Health Check
# --------------------------------------------------

@app.get("/api/health")
def health():
    return {
        "status": "ok",
        "application": "MediDiet-AI",
        "ai_provider": "Ollama",
        "ai_model": settings.ollama_model,
    }


# --------------------------------------------------
# Database Health Check
# --------------------------------------------------

@app.get("/api/health/database")
def database_health():
    with engine.connect() as connection:
        result = connection.execute(
            text("SELECT version();")
        )

        version = result.scalar()

    return {
        "status": "connected",
        "database": "PostgreSQL",
        "version": version,
    }