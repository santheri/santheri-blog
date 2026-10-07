from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, Field

VALID_CATEGORIES = ["Travel", "Technology", "Life"]
VALID_FONT_STYLES = ["serif", "sans", "editorial", "mono", "minimal"]

class PostBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    slug: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    category: str = Field(..., description="Must be Travel, Technology, or Life")
    content: str = Field(..., min_length=5)
    cover_image: Optional[str] = None
    font_style: Optional[str] = Field("serif", description="serif, sans, editorial, mono, or minimal")
    is_draft: Optional[bool] = False
    reading_time: Optional[str] = None

class PostCreate(PostBase):
    pass

class PostUpdate(BaseModel):
    title: Optional[str] = None
    slug: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    content: Optional[str] = None
    cover_image: Optional[str] = None
    font_style: Optional[str] = None
    is_draft: Optional[bool] = None
    reading_time: Optional[str] = None

class PostResponse(PostBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class DatabaseStatus(BaseModel):
    is_neon: bool
    database_type: str
    url_configured: bool
    total_posts: int
    error: Optional[str] = None

class UploadResponse(BaseModel):
    url: str
    filename: str

class SubscribeRequest(BaseModel):
    email: str = Field(..., min_length=5, max_length=255)

class SubscriberResponse(BaseModel):
    id: int
    email: str
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True

class SubscribeStatusResponse(BaseModel):
    success: bool
    message: str
    email: str
    already_subscribed: bool = False

class SubscribersSummary(BaseModel):
    total_active: int
    smtp_configured: bool
    subscribers: List[SubscriberResponse]

class NoteBase(BaseModel):
    title: str = Field(..., min_length=2, max_length=255)
    thought: str = Field(..., min_length=3)

class NoteCreate(NoteBase):
    pass

class NoteUpdate(BaseModel):
    title: Optional[str] = None
    thought: Optional[str] = None

class NoteResponse(NoteBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class AdminVerifyRequest(BaseModel):
    password: str

class AdminVerifyResponse(BaseModel):
    success: bool
    message: str
    token: Optional[str] = None

