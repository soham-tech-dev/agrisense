import time
import logging
from typing import Dict, Any, Optional

logger = logging.getLogger(__name__)

class CacheService:
    def __init__(self):
        self._store: Dict[str, Dict[str, Any]] = {}

    def get(self, key: str, ttl_seconds: Optional[int] = None) -> Optional[Dict[str, Any]]:
        if key not in self._store:
            return None
        
        entry = self._store[key]
        now = time.time()
        
        if ttl_seconds is not None:
            if now - entry["stored_at"] > ttl_seconds:
                logger.info(f"Cache key expired: {key}")
                return None
                
        return entry["data"]

    def set(self, key: str, data: Dict[str, Any]) -> None:
        self._store[key] = {
            "data": data,
            "stored_at": time.time(),
            "formatted_time": time.strftime("%Y-%m-%d %H:%M:%S")
        }

    def clear(self) -> None:
        self._store.clear()

cache_service = CacheService()
