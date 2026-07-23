# SnapDin Backend

Standalone Express.js backend for the SnapDin TikTok downloader.
Deployable independently to **Koyeb** (or any Node.js host).

---

## Installation

```bash
cd snapdin-backend
npm install
cp .env.example .env
```

---

## Run

```bash
# Development — hot-reload via nodemon
npm run dev

# Production
npm start
```

---

## API Endpoints

### `GET /`
Server status check.
```json
{ "success": true, "message": "SnapDin Backend Running" }
```

### `GET /health`
Health probe (used by Koyeb / load balancers).
```json
{ "success": true, "status": "OK" }
```

### `POST /api/download`
Fetch TikTok video info.

**Request body:**
```json
{ "url": "https://vt.tiktok.com/xxxxx" }
```

**Success `200`:**
```json
{
  "success": true,
  "data": {
    "title": "Sample TikTok Video",
    "author": "@snapdin",
    "thumbnail": "https://example.com/thumbnail.jpg",
    "duration": "00:15",
    "downloads": {
      "nowm":  "https://example.com/video.mp4",
      "wm":    "https://example.com/video-wm.mp4",
      "mp3":   "https://example.com/audio.mp3",
      "cover": "https://example.com/cover.jpg"
    }
  }
}
```

**Invalid URL `400`:**
```json
{ "success": false, "message": "Invalid TikTok URL" }
```

**Rate limited `429`:**
```json
{ "success": false, "message": "Too many requests" }
```

---

## Folder Structure

```
snapdin-backend/
├── src/
│   ├── config/
│   │   └── cors.js               CORS options
│   ├── controllers/
│   │   ├── downloadController.js POST /api/download handler
│   │   └── healthController.js   GET / and GET /health handlers
│   ├── middleware/
│   │   ├── errorHandler.js       Global error handler
│   │   ├── rateLimiter.js        100 req / 15 min
│   │   └── validateUrl.js        TikTok URL whitelist
│   ├── routes/
│   │   ├── download.js           /api/download route
│   │   └── health.js             / and /health routes
│   ├── services/
│   │   └── tiktokService.js      Mock — ready for real impl
│   ├── utils/
│   │   ├── logger.js             Timestamped console logger
│   │   └── response.js           successResponse / errorResponse
│   ├── app.js                    Express app setup
│   └── server.js                 Entry point
├── .env
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## Environment Variables

| Variable           | Default       | Description                              |
|--------------------|---------------|------------------------------------------|
| `PORT`             | `3001`        | HTTP port                                |
| `NODE_ENV`         | `development` | `development` or `production`            |
| `ALLOWED_ORIGINS`  | *(unset = \*)* | Comma-separated allowed CORS origins     |

---

## Deploy to Koyeb

1. Push `snapdin-backend/` to its own Git repository.
2. Create a new Koyeb **Web Service** → connect the repo.
3. Set **Run command**: `npm start`
4. Add environment variables: `PORT`, `NODE_ENV=production`, `ALLOWED_ORIGINS`.
5. Set the **Health check path** to `/health`.
