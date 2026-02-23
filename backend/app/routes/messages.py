from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.models import Message, User
from app.schemas.schemas import MessageCreate, MessageResponse
from app.models import get_db
from app.routes.auth import get_current_user

router = APIRouter(prefix="/messages", tags=["messages"])

@router.post("", response_model=MessageResponse)
async def send_message(
    message: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Check if recipient exists
    recipient = db.query(User).filter(User.id == message.to_user_id).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if blocked
    if current_user in recipient.blocked:
        raise HTTPException(status_code=403, detail="You are blocked by this user")
    
    db_message = Message(
        from_user_id=current_user.id,
        to_user_id=message.to_user_id,
        encrypted_text=message.encrypted_text
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message

@router.get("/thread/{user_id}", response_model=list[MessageResponse])
async def get_message_thread(
    user_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    messages = db.query(Message).filter(
        ((Message.from_user_id == current_user.id) & (Message.to_user_id == user_id)) |
        ((Message.from_user_id == user_id) & (Message.to_user_id == current_user.id))
    ).order_by(Message.created_at).all()
    
    return messages

@router.post("/{message_id}/read")
async def mark_as_read(
    message_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    if message.to_user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    message.is_read = True
    db.commit()
    return {"message": "Message marked as read"}
