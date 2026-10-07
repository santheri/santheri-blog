import time
import hmac
import hashlib
import secrets
from typing import Optional
from fastapi import Security, HTTPException, status, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from config import settings

# HTTPBearer adds the standard "Authorize" 🔒 button in Swagger UI (/docs)
security = HTTPBearer(auto_error=False)

TOKEN_EXPIRY_SECONDS = 7 * 24 * 60 * 60  # 7 days

def get_admin_password() -> str:
    """Returns the configured admin password or default fallback."""
    return (settings.admin_password or "santheri2026").strip()

def create_admin_token() -> str:
    """Generate a tamper-proof HMAC-SHA256 signed session token for the admin."""
    ts = str(int(time.time()))
    secret = get_admin_password().encode("utf-8")
    sig = hmac.new(secret, ts.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{ts}.{sig}"

def verify_signed_token(token: str) -> bool:
    """Verify that a token was signed by the current admin_password and has not expired."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return False
        ts_str, sig = parts
        ts = int(ts_str)
        # Check expiry (7 days) and clock skew tolerance (60s)
        now = time.time()
        if now - ts > TOKEN_EXPIRY_SECONDS or now < ts - 60:
            return False
        secret = get_admin_password().encode("utf-8")
        expected_sig = hmac.new(secret, ts_str.encode("utf-8"), hashlib.sha256).hexdigest()
        return secrets.compare_digest(sig, expected_sig)
    except Exception:
        return False

def verify_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key"),
    x_admin_password: Optional[str] = Header(None, alias="X-Admin-Password")
) -> bool:
    """
    Enforces admin authentication across protected API endpoints.
    Accepts:
      1. Standard Bearer token via Authorization header (Swagger UI & REST API)
      2. X-Admin-Key or X-Admin-Password headers
    Validates either the direct admin password or a signed session token.
    """
    token = None
    if credentials and credentials.credentials:
        token = credentials.credentials.strip()
    elif x_admin_key:
        token = x_admin_key.strip()
    elif x_admin_password:
        token = x_admin_password.strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Admin authentication required. Please provide a valid Bearer token or X-Admin-Key.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    expected_pw = get_admin_password()

    # 1. Match direct password (constant time comparison)
    if secrets.compare_digest(token, expected_pw):
        return True

    # 2. Match signed HMAC session token
    if verify_signed_token(token):
        return True

    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid admin credentials or expired session. Access denied.",
        headers={"WWW-Authenticate": "Bearer"},
    )

def is_admin_authenticated(
    credentials: Optional[HTTPAuthorizationCredentials] = Security(security),
    x_admin_key: Optional[str] = Header(None, alias="X-Admin-Key")
) -> bool:
    """Optional check that returns True/False without raising an HTTP 401 exception."""
    try:
        return verify_admin(credentials=credentials, x_admin_key=x_admin_key)
    except HTTPException:
        return False
