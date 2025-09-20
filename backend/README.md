# FastAPI Backend

A FastAPI backend with async job processing, real-time progress streaming via SSE, retry mechanisms, and Replicate API integration.

## Features

- **Job Management**: Create and track image generation jobs
- **Replicate Integration**: Real image generation using Replicate's API
- **Async Processing**: Bounded concurrent processing with configurable limits
- **Retry Logic**: Automatic retry with exponential backoff for failed tasks  
- **Real-time Progress**: Multiple transport options for live job progress:
  - Server-Sent Events (SSE) streaming
  - WebSocket streaming with same payload format
- **Polling Support**: REST endpoint for clients without real-time support
- **Metrics**: TTFI (Time to First Item) and total duration tracking

## Setup

1. Create and activate virtual environment:
```bash
python3 -m venv .venv
source .venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up environment variables (create a `.env` file):
```bash
cp .env.example .env
# Edit the .env file and configure
```

4. Run the server:
```bash
uvicorn app.main:app --reload --port 8080
```

## API Endpoints

### Basic Endpoints
- `GET /health` - Health check

### Authentication Endpoint

**Hardcoded Demo Credentials**
- **Email**: `test@example.com`
- **Password**: `password123`

- `POST /api/auth/login`

### Job Management
- `POST /api/generate` - Create new generation job
- `GET /api/generate/{job_id}` - Poll current results (alternative to SSE)
- `GET /api/generate/{job_id}/stream` - Stream real-time progress via SSE  
- `GET /api/generate/{job_id}/metrics` - Get job performance metrics

## Example Usage

### 1. Login and get access token:
```bash
curl -X POST "http://localhost:8080/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'
```

### 2. Create a generation job (protected):
```bash
TOKEN="your_access_token_here"
curl -X POST "http://localhost:8080/api/generate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"prompt": "A beautiful sunset over mountains", "num_images": 5}'
```

### 3. Stream progress in real-time (protected):

**Server-Sent Events:**
```bash
curl -N "http://localhost:8080/api/generate/JOB_ID/stream" \
  -H "Authorization: Bearer $TOKEN"
```

**WebSocket (using wscat or similar tool):**
```bash
# Install wscat: npm install -g wscat
wscat -c "ws://localhost:8080/api/generate/JOB_ID?token=$TOKEN"
```

### 4. Poll for progress (protected):
```bash
curl "http://localhost:8080/api/generate/JOB_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### 5. Get job metrics (protected):
```bash
curl "http://localhost:8080/api/generate/JOB_ID/metrics" \
  -H "Authorization: Bearer $TOKEN"
```
