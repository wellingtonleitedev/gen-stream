# FastAPI Backend

A minimal FastAPI backend with hello, health, SSE demo endpoints, and job generation API.

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

## Test

Test the health endpoint:
```bash
curl http://localhost:8080/health
```
Expected response: `{"status":"ok"}`

Create a generation job:
```bash
curl -X POST "http://localhost:8080/api/generate" \
  -H "Content-Type: application/json" \
  -d '{"prompt": "A beautiful sunset", "num_images": 5}'
```
Expected response: `{"job_id": "uuid-string"}`

Fetch a job by ID (replace with actual job ID):
```bash
curl http://localhost:8080/api/generate/your-job-id-here
```
Expected: Complete job state with prompt, status, results, etc.
