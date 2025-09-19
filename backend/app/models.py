from datetime import datetime
from enum import Enum
from typing import List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field, validator


class JobStatus(str, Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ResultStatus(str, Enum):
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"


class ImageResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    status: ResultStatus = ResultStatus.RUNNING
    url: Optional[str] = None
    error: Optional[str] = None


class Job(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    prompt: str
    num_images: int
    status: JobStatus = JobStatus.PENDING
    created_at: datetime = Field(default_factory=datetime.utcnow)
    results: List[ImageResult] = Field(default_factory=list)

    def __init__(self, **data):
        super().__init__(**data)
        # Pre-fill results with running status
        if not self.results:
            self.results = [
                ImageResult() for _ in range(self.num_images)
            ]


class GenerateRequest(BaseModel):
    prompt: str = Field(..., min_length=1)
    num_images: int = Field(..., ge=5, le=20)

    @validator('prompt')
    def validate_prompt(cls, v):
        if len(v.strip()) < 3:
            raise ValueError('Prompt must be at least 3 characters long')
        return v.strip()


class GenerateResponse(BaseModel):
    job_id: str