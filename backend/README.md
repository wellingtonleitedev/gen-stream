# FastAPI Backend

A FastAPI backend with async job processing, real-time progress streaming via SSE, retry mechanisms, and metrics tracking.

## Features

- **Job Management**: Create and track image generation jobs
- **Async Processing**: Bounded concurrent processing with configurable limits
- **Retry Logic**: Automatic retry with exponential backoff for failed tasks  
- **Real-time Progress**: Server-Sent Events streaming for live job progress
- **Polling Support**: REST endpoint for clients without SSE support
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

3. Run the server:
```bash
uvicorn app.main:app --reload --port 8080
```

## API Endpoints

### Basic Endpoints
- `GET /health` - Health check

### Job Management
- `POST /api/generate` - Create new generation job
- `GET /api/generate/{job_id}` - Poll current results (alternative to SSE)
- `GET /api/generate/{job_id}/stream` - Stream real-time progress via SSE  
- `GET /api/generate/{job_id}/metrics` - Get job performance metrics

## Example Usage

Create a generation job:
```bash
curl -X POST "http://localhost:8080/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset", "num_images": 8}'
```

Stream progress in real-time (replace JOB_ID):
```bash
curl -N http://localhost:8080/api/generate/JOB_ID/stream
```

Poll for progress (replace JOB_ID):
```bash
curl http://localhost:8080/api/generate/JOB_ID
```

Get job metrics (replace JOB_ID):
```bash
curl http://localhost:8080/api/generate/JOB_ID/metrics
```
