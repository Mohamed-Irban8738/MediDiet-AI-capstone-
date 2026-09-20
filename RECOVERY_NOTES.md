# MediDiet-AI recovered project

This folder was reconstructed from the MediDiet-AI project archive available in the conversation and the latest backend changes from the development session.

## Latest confirmed backend features
- PostgreSQL configuration
- JWT registration/login
- Patient profile
- Doctor profile
- Consultation creation/listing
- Local Ollama integration
- Gemma 3:4B AI nutrition assessment
- AI assessment persistence in `ai_assessments`

## Runtime
- Python 3.13 (global install; no virtual environment required)
- FastAPI + SQLAlchemy
- PostgreSQL 16
- Ollama with `gemma3:4b`

The existing PostgreSQL database is external to this ZIP and is not included.
