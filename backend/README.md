# LUMANARA Backend API

A FastAPI-based social media and messaging platform backend.

## Features

- User authentication (register/login)
- Post creation and interaction (likes, comments)
- Direct messaging with encryption support
- Friend management
- User blocking
- Real-time status

## Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

### 2. Setup Database

Install PostgreSQL locally or use a remote instance.

```bash
# Create database
createdb lumanara_db
```

### 3. Configure Environment

```bash
cp .env.example .env
# Edit .env with your database URL and other settings
```

### 4. Run the Server

```bash
python main.py
```

The API will be available at `http://localhost:8000`

- API Documentation: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## API Endpoints

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - Login user

### Posts
- `POST /posts` - Create post
- `GET /posts` - List posts
- `GET /posts/{post_id}` - Get post details
- `POST /posts/{post_id}/like` - Like post
- `POST /posts/{post_id}/unlike` - Unlike post

### Users
- `GET /users/me` - Get current user
- `GET /users/{user_id}` - Get user profile
- `GET /users` - Search users
- `POST /users/{user_id}/friend-request` - Send friend request
- `POST /users/friend-requests/{request_id}/accept` - Accept friend request
- `POST /users/{user_id}/block` - Block user
- `POST /users/{user_id}/unblock` - Unblock user

### Messages
- `POST /messages` - Send message
- `GET /messages/thread/{user_id}` - Get message thread
- `POST /messages/{message_id}/read` - Mark message as read

## Development

Requirements:
- Python 3.10+
- PostgreSQL 12+
- Node.js 16+ (for running frontend)

## Connecting Frontend

Update your CORS_ORIGINS in .env to include your frontend URL:

```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Then in your React frontend, use:

```typescript
const API_BASE_URL = 'http://localhost:8000';
```

## Docker (Optional)

```bash
docker build -t lumanara-backend .
docker run -p 8000:8000 lumanara-backend
```
