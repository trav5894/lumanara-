from __future__ import annotations
from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, List

# User Schemas
class UserBase(BaseModel):
    name: str
    handle: str
    email: EmailStr
    bio: Optional[str] = None
    avatar_url: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(UserBase):
    id: str
    is_live: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class UserDetailResponse(UserResponse):
    posts: List['PostResponse'] = []
    friends: List['UserResponse'] = []

# Post Schemas
class PostBase(BaseModel):
    text: str

class PostCreate(PostBase):
    pass

class PostResponse(BaseModel):
    id: str
    author_id: str
    author: UserResponse
    text: str
    likes_count: int
    comments_count: int
    shares_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class PostDetailResponse(PostResponse):
    comments: List['CommentResponse'] = []

# Comment Schemas
class CommentBase(BaseModel):
    text: str

class CommentCreate(CommentBase):
    pass

class CommentResponse(BaseModel):
    id: str
    post_id: str
    author_id: str
    author: UserResponse
    text: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Message Schemas
class MessageBase(BaseModel):
    to_user_id: str
    encrypted_text: str

class MessageCreate(MessageBase):
    pass

class MessageResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    encrypted_text: str
    is_read: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Friend Request Schemas
class FriendRequestBase(BaseModel):
    to_user_id: str

class FriendRequestCreate(FriendRequestBase):
    pass

class FriendRequestResponse(BaseModel):
    id: str
    from_user_id: str
    to_user_id: str
    status: str
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token Schema
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Rebuild models to resolve forward references
UserDetailResponse.model_rebuild()
PostDetailResponse.model_rebuild()
CommentResponse.model_rebuild()