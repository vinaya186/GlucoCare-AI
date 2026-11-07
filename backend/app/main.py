"""
GlucoCare AI - FastAPI Application
Provides healthcare risk screening endpoints, ML pipeline integration, and demo history.
"""

import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.predict import router as predict_router
from app.api.history import router as history_router
from app.database import init_db

app = FastAPI(
    title="GlucoCare AI - Predictive Screening API",
    description=(
        "Research and educational diabetes risk assessment API based on the Pima Indians dataset. "
        "Strictly provides probabilistic estimates, not clinical diagnostic validation."
    ),
    version="1.0.0",
)

# Configure CORS origins from environment variable or allow all for development
allowed_origins_env = os.getenv("ALLOWED_ORIGINS") or os.getenv("FRONTEND_URL")
if allowed_origins_env:
    origins = [orig.strip() for orig in allowed_origins_env.split(",") if orig.strip()]
else:
    origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database
init_db()

# Mount API routers
app.include_router(predict_router)
app.include_router(history_router)


@app.get("/")
def root_endpoint():
    return {
        "service": "GlucoCare AI API",
        "status": "operational",
        "docs_url": "/docs",
        "version": "1.0.0",
    }


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "database": "sqlite_ready",
        "service": "GlucoCare AI",
    }
