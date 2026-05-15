from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserOut(BaseModel):
    id: int
    email: str
    full_name: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}

class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"

class ConnectionCreate(BaseModel):
    name: str
    db_type: str
    host: Optional[str] = None
    port: Optional[int] = None
    database: Optional[str] = None
    username: Optional[str] = None
    password: Optional[str] = None
    extra_config: Optional[str] = None

class ConnectionOut(BaseModel):
    id: int
    name: str
    db_type: str
    host: Optional[str]
    port: Optional[int]
    database: Optional[str]
    username: Optional[str]
    is_active: bool
    created_at: datetime
    model_config = {"from_attributes": True}
