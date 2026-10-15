import sys
import logging
import logging.config
from app.core.config import settings

def setup_logging():
    """
    Configures structured production logging for FastAPI application.
    """
    if hasattr(sys.stdout, "reconfigure"):
        try:
            sys.stdout.reconfigure(encoding="utf-8", errors="replace")
            sys.stderr.reconfigure(encoding="utf-8", errors="replace")
        except Exception:
            pass

    log_level = logging.INFO if settings.ENVIRONMENT.lower() == "production" else logging.DEBUG

    logging_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "default": {
                "format": "[%(asctime)s] [%(levelname)s] [%(name)s:%(lineno)d] - %(message)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
            },
            "json": {
                "format": '{"time": "%(asctime)s", "level": "%(levelname)s", "logger": "%(name)s", "message": "%(message)s"}',
                "datefmt": "%Y-%m-%dT%H:%M:%SZ",
            },
        },
        "handlers": {
            "console": {
                "class": "logging.StreamHandler",
                "stream": sys.stdout,
                "formatter": "default",
            },
        },
        "root": {
            "level": log_level,
            "handlers": ["console"],
        },
        "loggers": {
            "uvicorn": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "uvicorn.error": {"level": "INFO"},
            "uvicorn.access": {"handlers": ["console"], "level": "INFO", "propagate": False},
            "app": {"handlers": ["console"], "level": log_level, "propagate": False},
        },
    }
    
    logging.config.dictConfig(logging_config)
    logger = logging.getLogger("app.main")
    logger.info(f"AgriSense logging initialized (Level: {log_level}, Environment: {settings.ENVIRONMENT})")
