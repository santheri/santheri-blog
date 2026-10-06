import os
import shutil
import uuid
import re
from contextlib import asynccontextmanager
from typing import List, Optional
import uvicorn
from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Query, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy import or_, desc

from database import engine, Base, get_db, get_database_info
import models
import schemas
import email_service
from config import settings
from seed_data import seed_default_posts, seed_default_notes, slugify

# Ensure database tables exist in Neon / DB
Base.metadata.create_all(bind=engine)

# Ensure upload directory exists
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed initial posts and notes if DB is newly created
    db = next(get_db())
    try:
        seed_default_posts(db)
        seed_default_notes(db)
    finally:
        db.close()
    yield
    # Shutdown logic if needed

app = FastAPI(
    title="Santheri Blog API",
    description="Backend API for Santheri's Personal Blog connected with Neon PostgreSQL",
    version="1.0.0",
    lifespan=lifespan
)

# Enable CORS for React Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static uploads
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

def estimate_reading_time(content: str) -> str:
    word_count = len(re.findall(r'\w+', content or ''))
    minutes = max(1, round(word_count / 200))
    return f"{minutes} min read"

@app.get("/")
def root():
    return {"message": "Santheri Blog API is running smoothly", "docs": "/docs"}

@app.get("/api/status", response_model=schemas.DatabaseStatus)
def get_system_status(db: Session = Depends(get_db)):
    info = get_database_info()
    count = db.query(models.Post).count()
    return {
        "is_neon": info["is_neon"],
        "database_type": info["database_type"],
        "url_configured": info["url_configured"],
        "total_posts": count,
        "error": info.get("error")
    }

@app.get("/api/categories")
def get_categories(db: Session = Depends(get_db)):
    categories = ["Travel", "Technology", "Life"]
    result = []
    for cat in categories:
        count = db.query(models.Post).filter(
            models.Post.category.ilike(cat),
            models.Post.is_draft == False
        ).count()
        result.append({"name": cat, "count": count})
    return result

@app.get("/api/posts", response_model=List[schemas.PostResponse])
def get_posts(
    category: Optional[str] = Query(None, description="Filter by Travel, Technology, or Life"),
    search: Optional[str] = Query(None, description="Search in title or description"),
    include_drafts: bool = Query(False, description="Include drafts for admin view"),
    db: Session = Depends(get_db)
):
    query = db.query(models.Post)
    
    if not include_drafts:
        query = query.filter(models.Post.is_draft == False)
        
    if category and category.lower() != "all":
        query = query.filter(models.Post.category.ilike(category.strip()))
        
    if search:
        search_term = f"%{search.strip()}%"
        query = query.filter(
            or_(
                models.Post.title.ilike(search_term),
                models.Post.description.ilike(search_term),
                models.Post.content.ilike(search_term)
            )
        )
        
    posts = query.order_by(desc(models.Post.created_at)).all()
    return posts

@app.get("/api/posts/{slug_or_id}", response_model=schemas.PostResponse)
def get_post(slug_or_id: str, db: Session = Depends(get_db)):
    post = None
    if slug_or_id.isdigit():
        post = db.query(models.Post).filter(models.Post.id == int(slug_or_id)).first()
    
    if not post:
        post = db.query(models.Post).filter(models.Post.slug == slug_or_id).first()
        
    if not post:
        raise HTTPException(status_code=404, detail="Blog post not found")
        
    return post

@app.post("/api/posts", response_model=schemas.PostResponse, status_code=status.HTTP_201_CREATED)
def create_post(post_in: schemas.PostCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    # Normalize category
    category_map = {"travel": "Travel", "technology": "Technology", "life": "Life"}
    normalized_category = category_map.get(post_in.category.strip().lower(), post_in.category.strip().title())
    
    # Generate slug if empty
    slug = post_in.slug or slugify(post_in.title)
    if not slug:
        slug = f"post-{uuid.uuid4().hex[:8]}"
        
    # Check if slug exists, if so append random suffix
    existing = db.query(models.Post).filter(models.Post.slug == slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:6]}"
        
    reading_time = post_in.reading_time or estimate_reading_time(post_in.content)
    
    db_post = models.Post(
        title=post_in.title.strip(),
        slug=slug,
        description=post_in.description.strip() if post_in.description else None,
        category=normalized_category,
        content=post_in.content,
        cover_image=post_in.cover_image,
        font_style=post_in.font_style or "serif",
        is_draft=bool(post_in.is_draft),
        reading_time=reading_time
    )
    db.add(db_post)
    db.commit()
    db.refresh(db_post)

    # Automatically notify active subscribers if post is published immediately
    if not db_post.is_draft:
        subscribers = db.query(models.Subscriber.email).filter(models.Subscriber.is_active == True).all()
        emails = [s[0] for s in subscribers]
        if emails:
            background_tasks.add_task(
                email_service.dispatch_post_notification_to_subscribers,
                db_post,
                emails
            )

    return db_post

@app.put("/api/posts/{post_id}", response_model=schemas.PostResponse)
def update_post(post_id: int, post_update: schemas.PostUpdate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    was_draft = db_post.is_draft
    update_data = post_update.dict(exclude_unset=True)
    
    if "category" in update_data and update_data["category"]:
        category_map = {"travel": "Travel", "technology": "Technology", "life": "Life"}
        cat = update_data["category"].strip().lower()
        update_data["category"] = category_map.get(cat, update_data["category"].strip().title())
        
    if "content" in update_data and update_data["content"] and "reading_time" not in update_data:
        update_data["reading_time"] = estimate_reading_time(update_data["content"])
        
    for key, value in update_data.items():
        setattr(db_post, key, value)
        
    db.commit()
    db.refresh(db_post)

    # If transitioned from draft to published, automatically notify subscribers
    if was_draft and not db_post.is_draft:
        subscribers = db.query(models.Subscriber.email).filter(models.Subscriber.is_active == True).all()
        emails = [s[0] for s in subscribers]
        if emails:
            background_tasks.add_task(
                email_service.dispatch_post_notification_to_subscribers,
                db_post,
                emails
            )

    return db_post

@app.post("/api/posts/{post_id}/notify-subscribers")
def notify_subscribers_manual(post_id: int, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Allows admin to manually trigger or re-broadcast a post notification to subscribers."""
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    if db_post.is_draft:
        raise HTTPException(status_code=400, detail="Cannot broadcast notifications for a draft post.")

    subscribers = db.query(models.Subscriber.email).filter(models.Subscriber.is_active == True).all()
    emails = [s[0] for s in subscribers]
    if not emails:
        return {"message": "No active subscribers found.", "count": 0}

    background_tasks.add_task(
        email_service.dispatch_post_notification_to_subscribers,
        db_post,
        emails
    )
    return {"message": f"Broadcasting notification to {len(emails)} active subscriber(s).", "count": len(emails)}

@app.delete("/api/posts/{post_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_post(post_id: int, db: Session = Depends(get_db)):
    db_post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not db_post:
        raise HTTPException(status_code=404, detail="Post not found")
    db.delete(db_post)
    db.commit()
    return None

# ==============================================================================
# NEWSLETTER SUBSCRIPTION ENDPOINTS
# ==============================================================================

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$')

@app.post("/api/subscribe", response_model=schemas.SubscribeStatusResponse)
def subscribe(sub_in: schemas.SubscribeRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    email = sub_in.email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")

    existing = db.query(models.Subscriber).filter(models.Subscriber.email == email).first()
    config = email_service.get_email_config()

    if existing:
        if existing.is_active:
            # Send confirmation email so the user gets instant delivery confirmation
            welcome_payload = email_service.build_welcome_email(email, config["base_url"])
            background_tasks.add_task(
                email_service.send_email,
                email,
                welcome_payload["subject"],
                welcome_payload["html"],
                welcome_payload["text"]
            )
            return {
                "success": True,
                "message": "You are subscribed! We sent a confirmation email to your inbox.",
                "email": email,
                "already_subscribed": True
            }
        else:
            existing.is_active = True
            db.commit()
            welcome_payload = email_service.build_welcome_email(email, config["base_url"])
            background_tasks.add_task(
                email_service.send_email,
                email,
                welcome_payload["subject"],
                welcome_payload["html"],
                welcome_payload["text"]
            )
            return {
                "success": True,
                "message": "Welcome back! Your subscription has been reactivated.",
                "email": email,
                "already_subscribed": False
            }

    # New subscriber
    new_sub = models.Subscriber(email=email, is_active=True)
    db.add(new_sub)
    db.commit()

    # Send welcome email asynchronously
    welcome_payload = email_service.build_welcome_email(email, config["base_url"])
    background_tasks.add_task(
        email_service.send_email,
        email,
        welcome_payload["subject"],
        welcome_payload["html"],
        welcome_payload["text"]
    )

    return {
        "success": True,
        "message": "Thank you for subscribing! You will receive new stories as soon as they are published.",
        "email": email,
        "already_subscribed": False
    }

@app.post("/api/unsubscribe")
def unsubscribe(sub_in: schemas.SubscribeRequest, db: Session = Depends(get_db)):
    email = sub_in.email.strip().lower()
    subscriber = db.query(models.Subscriber).filter(models.Subscriber.email == email).first()
    if subscriber:
        subscriber.is_active = False
        db.commit()
    return {"success": True, "message": "You have been unsubscribed."}

@app.get("/api/subscribers", response_model=schemas.SubscribersSummary)
def get_subscribers(db: Session = Depends(get_db)):
    subscribers = db.query(models.Subscriber).order_by(desc(models.Subscriber.created_at)).all()
    total_active = sum(1 for s in subscribers if s.is_active)
    config = email_service.get_email_config()
    return {
        "total_active": total_active,
        "smtp_configured": config["configured"],
        "subscribers": subscribers
    }

@app.post("/api/subscribers/test-email")
def send_test_subscriber_email(sub_in: schemas.SubscribeRequest, db: Session = Depends(get_db)):
    email = sub_in.email.strip().lower()
    if not EMAIL_REGEX.match(email):
        raise HTTPException(status_code=400, detail="Please enter a valid email address.")
    config = email_service.get_email_config()
    if not config["configured"]:
        raise HTTPException(status_code=400, detail="SMTP is not configured in backend/.env")

    test_content = email_service.build_test_email(email, config["base_url"])
    result = email_service.send_email(
        email,
        test_content["subject"],
        test_content["html"],
        test_content["text"]
    )
    if not result.get("success"):
        raise HTTPException(status_code=500, detail=result.get("error", "Failed to send test email"))
    return {"success": True, "message": f"Test email sent successfully to {email}!"}


@app.post("/api/upload", response_model=schemas.UploadResponse)
async def upload_file(file: UploadFile = File(...)):
    # Validate extension
    allowed_extensions = {".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif"}
    filename = file.filename or "upload.jpg"
    _, ext = os.path.splitext(filename)
    if ext.lower() not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file extension {ext}. Allowed: {', '.join(allowed_extensions)}"
        )
        
    unique_filename = f"{uuid.uuid4().hex[:12]}{ext.lower()}"
    destination_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(destination_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Return URL reachable from frontend
    file_url = f"/uploads/{unique_filename}"
    return {"url": file_url, "filename": unique_filename}

# ==============================================================================
# FIELD NOTES ENDPOINTS
# ==============================================================================

@app.get("/api/notes", response_model=List[schemas.NoteResponse])
def get_notes(db: Session = Depends(get_db)):
    notes = db.query(models.Note).order_by(desc(models.Note.created_at)).all()
    return notes

@app.post("/api/notes", response_model=schemas.NoteResponse, status_code=status.HTTP_201_CREATED)
def create_note(note_in: schemas.NoteCreate, db: Session = Depends(get_db)):
    db_note = models.Note(
        title=note_in.title.strip(),
        thought=note_in.thought.strip()
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note

@app.put("/api/notes/{note_id}", response_model=schemas.NoteResponse)
def update_note(note_id: int, note_update: schemas.NoteUpdate, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    if note_update.title is not None:
        db_note.title = note_update.title.strip()
    if note_update.thought is not None:
        db_note.thought = note_update.thought.strip()
    db.commit()
    db.refresh(db_note)
    return db_note

@app.delete("/api/notes/{note_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_note(note_id: int, db: Session = Depends(get_db)):
    db_note = db.query(models.Note).filter(models.Note.id == note_id).first()
    if not db_note:
        raise HTTPException(status_code=404, detail="Note not found")
    db.delete(db_note)
    db.commit()
    return None

# ==============================================================================
# ADMIN AUTHENTICATION VERIFY ENDPOINT
# ==============================================================================

@app.post("/api/admin/verify", response_model=schemas.AdminVerifyResponse)
def verify_admin_password(payload: schemas.AdminVerifyRequest):
    expected_password = settings.admin_password.strip()
    if not payload.password or payload.password.strip() != expected_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect admin passcode. Access denied."
        )
    return {
        "success": True,
        "message": "Admin authenticated successfully."
    }

if __name__ == "__main__":
    host = "0.0.0.0" if (settings.render or os.environ.get("PORT")) else "127.0.0.1"
    uvicorn.run("main:app", host=host, port=settings.port, reload=False if os.environ.get("PORT") else True)

