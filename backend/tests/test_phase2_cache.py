import time
import pytest
from app.services.cache_service import CacheService

def test_cache_service_set_get():
    cs = CacheService()
    cs.set("key1", {"temp": 30.5})
    res = cs.get("key1", ttl_seconds=10)
    assert res is not None
    assert res["temp"] == 30.5

def test_cache_service_ttl_expiration():
    cs = CacheService()
    cs.set("key_exp", {"val": 123})
    # Force older stored timestamp
    cs._store["key_exp"]["stored_at"] = time.time() - 20
    res = cs.get("key_exp", ttl_seconds=10)
    assert res is None
