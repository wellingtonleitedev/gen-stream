# FastAPI Backend

Backend service built with Python and FastAPI that powers batch image generation workflows. It provides authentication, job creation, concurrency-controlled integration with external AI models, real-time progress streaming via SSE, and metrics reporting (e.g. time-to-first-image, total job duration). Designed to be lightweight, resilient, and easy to extend for production-ready scenarios.

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

Test the hello endpoint:
```bash
curl http://localhost:8080/hello
```

Expected response: `{"message":"hello world"}`
