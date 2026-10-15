from datetime import datetime, timedelta
import time
from typing import Any, Union, Optional, Dict
from jose import jwt, JWTError
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_access_token(subject: Union[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token_claims(token: str) -> Optional[Dict[str, Any]]:
    """Decodes token claims, supporting local HMAC tokens and Firebase/Google ID tokens."""
    # 1. Try local HMAC verification first
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        pass

    # 2. Try Firebase ID token or external JWT inspection
    try:
        claims = jwt.get_unverified_claims(token)
        if claims and isinstance(claims, dict):
            exp = claims.get("exp")
            if exp and exp < time.time():
                # Expired token
                return None
            return claims
    except Exception:
        pass

    return None

def verify_token(token: str) -> Optional[str]:
    claims = decode_token_claims(token)
    if claims:
        return claims.get("sub") or claims.get("user_id")
    return None

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)
