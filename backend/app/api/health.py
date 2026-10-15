import os
import time
from fastapi import APIRouter, Depends, status
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.database.session import get_db
from app.core.config import settings

router = APIRouter()

START_TIME = time.time()

@router.get("/health", tags=["Health Check"])
@router.get("/healthz", tags=["Health Check"])
def health_check(db: Session = Depends(get_db)):
    """
    Production health check endpoint verifying core subsystem availability:
    - Database connectivity
    - ChromaDB Vector store directory availability
    - Static upload storage status
    """
    health_status = {
        "status": "ok",
        "healthy": True,
        "app": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "phase": 1,
        "environment": settings.ENVIRONMENT,
        "uptime_seconds": round(time.time() - START_TIME, 2),
        "checks": {}
    }

    # 1. Database Check
    try:
        db.execute(text("SELECT 1"))
        health_status["checks"]["database"] = {"status": "ok", "type": settings.DATABASE_URL.split(":")[0]}
    except Exception as e:
        health_status["status"] = "degraded"
        health_status["checks"]["database"] = {"status": "error", "detail": str(e)}

    # 2. ChromaDB Vector Store Check
    chroma_dir = os.path.abspath(settings.CHROMA_DB_DIR)
    health_status["checks"]["vector_db"] = {
        "status": "ok" if os.path.exists(chroma_dir) else "warning_not_seeded",
        "path": chroma_dir
    }

    # 3. Static Uploads Directory Check
    static_dir = os.path.abspath("static")
    health_status["checks"]["storage"] = {
        "status": "ok" if os.path.exists(static_dir) else "created_on_demand",
        "path": static_dir
    }

    # 4. API Keys Availability Check (Non-secret reporting)
    health_status["checks"]["api_keys"] = {
        "anthropic_claude": bool(settings.ANTHROPIC_API_KEY),
        "openweather": bool(settings.OPENWEATHER_API_KEY),
        "data_gov_in": bool(settings.DATA_GOV_IN_API_KEY)
    }

    http_status = status.HTTP_200_OK if health_status["status"] in ["ok", "healthy"] else status.HTTP_503_SERVICE_UNAVAILABLE
    return JSONResponse(status_code=http_status, content=health_status)
