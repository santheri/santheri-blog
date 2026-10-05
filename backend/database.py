import os
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker
from dotenv import load_dotenv

# Load environment variables from .env if present
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")

# If Neon URL is provided, format it properly for SQLAlchemy psycopg2
is_neon = False
if DATABASE_URL:
    # Normalize postgres:// to postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
    
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
except Exception as e:
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
        "url_configured": bool(os.getenv("DATABASE_URL") or os.getenv("NEON_DATABASE_URL")),
    }
