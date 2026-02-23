Node backend for Lumanara
=========================

This is a lightweight Node/Express backend intended to replace the previous Python backend to simplify builds and deployment.

Start locally:

```
cd backend
npm install
npm start
```

Environment:
- `PORT` — port to listen on (default 10000)
- `SECRET_KEY` — JWT secret

Docker / Render:
- The repository includes `backend/Dockerfile`; Render can build this service using Docker (recommended). The provided `backend/render.yaml` is configured to use Docker builds.
