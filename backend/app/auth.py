import os
from datetime import datetime, timedelta
from typing import Optional
import jwt
from fastapi import HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class AuthService:
    def __init__(self):
        self.secret = os.getenv("AUTH_SECRET", "your-secret-key-change-in-production")
        self.expires_minutes = 60
        self.algorithm = "HS256"
        
        # Demo credentials - hardcoded for assignment
        self.demo_email = "test@example.com"
        self.demo_password = "password123"

    def authenticate_user(self, email: str, password: str) -> bool:
        """Validate user credentials - simplified for demo"""
        return email == self.demo_email and password == self.demo_password

    def create_access_token(self, email: str) -> tuple[str, int]:
        """Create a JWT access token"""
        expire = datetime.utcnow() + timedelta(minutes=self.expires_minutes)
        
        payload = {
            "sub": email,
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        }
        
        token = jwt.encode(payload, self.secret, algorithm=self.algorithm)
        return token, self.expires_minutes * 60

    def verify_token(self, token: str) -> Optional[str]:
        """Verify JWT token and return user email if valid"""
        try:
            payload = jwt.decode(token, self.secret, algorithms=[self.algorithm])
            email = payload.get("sub")
            token_type = payload.get("type")
            
            if email is None or token_type != "access":
                return None
                
            return email
        except jwt.ExpiredSignatureError:
            return None
        except jwt.InvalidTokenError:
            return None

    async def login(self, request: LoginRequest) -> LoginResponse:
        """Handle login and return access token"""
        if not self.authenticate_user(request.email, request.password):
            raise HTTPException(
                status_code=401,
                detail="Invalid email or password"
            )
        
        token, expires_in = self.create_access_token(request.email)
        return LoginResponse(
            access_token=token,
            expires_in=expires_in
        )


auth_service = AuthService()

security = HTTPBearer()


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Dependency to validate and extract user from JWT token"""
    token = credentials.credentials
    user_email = auth_service.verify_token(token)
    
    if user_email is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return user_email