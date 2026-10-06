from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from config import settings
import re

RAW_URL = settings.database_url
DATABASE_URL = RAW_URL
is_neon = False
db_error = None

if DATABASE_URL:
    # Clean up whitespace and any surrounding quotes that users commonly paste in env vars
    DATABASE_URL = str(DATABASE_URL).strip().strip("'").strip('"')
    
    # Handle case where user pasted psql command: psql 'postgresql://...'
    psql_match = re.search(r"'(postgresql://[^']+)'", DATABASE_URL)
    if psql_match:
        DATABASE_URL = psql_match.group(1)
        
    # Normalize postgres:// to postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

    # Detect available PostgreSQL drivers and adapt URL dialect
    has_psycopg = False
    has_psycopg2 = False
    try:
        import psycopg
        has_psycopg = True
    except ImportError:
        pass

    try:
        import psycopg2
        has_psycopg2 = True
    except ImportError:
        pass

    # If psycopg2 is installed but psycopg (v3) is not, route to psycopg2
    if has_psycopg2 and not has_psycopg:
        if DATABASE_URL.startswith("postgresql+psycopg://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg://", "postgresql+psycopg2://", 1)
        elif DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
    # If psycopg (v3) is installed and psycopg2 is not, route to psycopg
    elif has_psycopg and not has_psycopg2:
        if DATABASE_URL.startswith("postgresql+psycopg2://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql+psycopg2://", "postgresql+psycopg://", 1)
        elif DATABASE_URL.startswith("postgresql://"):
            DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)

    # Ensure sslmode=require for Neon if not specified
    if "neon.tech" in DATABASE_URL and "sslmode" not in DATABASE_URL:
        separator = "&" if "?" in DATABASE_URL else "?"
        DATABASE_URL = f"{DATABASE_URL}{separator}sslmode=require"
    is_neon = True
else:
    # Fallback to local SQLite so the system can run seamlessly if Neon credentials are not yet set
    DATABASE_URL = "sqlite:///./blog.db"

connect_args = {"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {}

try:
    engine = create_engine(
        DATABASE_URL,
        connect_args=connect_args,
        pool_pre_ping=True
    )
    # Test connection on startup if postgresql URL is provided
    if not DATABASE_URL.startswith("sqlite"):
        with engine.connect() as test_conn:
            pass
except Exception as e:
    db_error = str(e)
    print(f"Warning: Failed to connect with primary DATABASE_URL ({e}). Falling back to sqlite.")
    DATABASE_URL = "sqlite:///./blog.db"
    engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    is_neon = False

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_database_info():
    return {
        "is_neon": is_neon and "neon.tech" in DATABASE_URL,
        "database_type": "Neon PostgreSQL" if (is_neon and "neon.tech" in DATABASE_URL) else ("PostgreSQL" if DATABASE_URL.startswith("postgresql") else "SQLite (Local)"),
        "url_configured": bool(settings.database_url),
        "error": db_error,
    }

