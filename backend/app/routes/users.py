from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.models import User, FriendRequest
from app.schemas.schemas import UserResponse, UserDetailResponse
from app.models import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/users", tags=["users"])

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return current_user

@router.get("/{user_id}", response_model=UserDetailResponse)
async def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("", response_model=list[UserResponse])
async def search_users(handle: str = "", db: Session = Depends(get_db)):
    users = db.query(User).filter(User.handle.ilike(f"%{handle}%")).limit(20).all()
    return users

@router.post("/{user_id}/friend-request")
async def send_friend_request(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if target user exists
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already friends
    if target_user in current_user.friends:
        raise HTTPException(status_code=400, detail="Already friends")
    
    # Check if blocked
    if target_user in current_user.blocked:
        raise HTTPException(status_code=400, detail="User is blocked")
    
    # Check existing request
    existing_request = db.query(FriendRequest).filter(
        FriendRequest.from_user_id == current_user.id,
        FriendRequest.to_user_id == user_id,
        FriendRequest.status == "pending"
    ).first()
    
    if existing_request:
        raise HTTPException(status_code=400, detail="Friend request already sent")
    
    friend_request = FriendRequest(from_user_id=current_user.id, to_user_id=user_id)
    db.add(friend_request)
    db.commit()
    
    return {"message": "Friend request sent"}

@router.post("/friend-requests/{request_id}/accept")
async def accept_friend_request(
    request_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    friend_request = db.query(FriendRequest).filter(FriendRequest.id == request_id).first()
    if not friend_request:
        raise HTTPException(status_code=404, detail="Friend request not found")
    
    if friend_request.to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    friend_request.status = "accepted"
    from_user = db.query(User).filter(User.id == friend_request.from_user_id).first()
    
    # Add to friends list (bidirectional)
    current_user.friends.append(from_user)
    from_user.friends.append(current_user)
    
    db.commit()
    return {"message": "Friend request accepted"}

@router.post("/{user_id}/block")
async def block_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user not in current_user.blocked:
        current_user.blocked.append(target_user)
        db.commit()
    
    return {"message": "User blocked"}

@router.post("/{user_id}/unblock")
async def unblock_user(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    target_user = db.query(User).filter(User.id == user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if target_user in current_user.blocked:
        current_user.blocked.remove(target_user)
        db.commit()
    
    return {"message": "User unblocked"}
