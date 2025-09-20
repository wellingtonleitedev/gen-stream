"""
Configuration module for the image generation backend.
Loads environment variables and provides centralized configuration management.
"""
import os
import logging
from typing import List
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

logger = logging.getLogger(__name__)


class Config:
    """Application configuration loaded from environment variables."""
    
    # CORS Configuration
    ALLOWED_ORIGINS: List[str] = os.getenv(
        "ALLOWED_ORIGINS", 
        "http://localhost:5173"
    ).split(",")
    
    # Authentication
    AUTH_SECRET: str = os.getenv("AUTH_SECRET", "your-secret-key-change-in-production")
    
    # Replicate API Configuration
    REPLICATE_API_TOKEN: str = os.getenv("REPLICATE_API_TOKEN", "")
    REPLICATE_MODEL: str = os.getenv(
        "REPLICATE_MODEL", 
        "stability-ai/stable-diffusion"
    )
    REPLICATE_MODEL_VERSION: str = os.getenv("REPLICATE_MODEL_VERSION", "")
    
    # Job Processing Configuration
    GEN_MAX_CONCURRENCY: int = int(os.getenv("GEN_MAX_CONCURRENCY", "5"))
    RETRY_ATTEMPTS: int = int(os.getenv("RETRY_ATTEMPTS", "3"))

config = Config()