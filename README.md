# 🚀 AI Image Generation Platform

Monorepo containing both backend (FastAPI, Python) and frontend (React/Next.js) for a batch image generation platform.
The system allows users to authenticate, submit prompts, generate images in parallel, and see results stream in real-time with metrics like time-to-first-image (TTFI) and total job duration.

## 📂 Project Structure
```
├── backend/        # Python FastAPI backend (API, SSE streaming, job runner)
└── frontend/       # React frontend with user interface
```

## 🛠 Tech Stack
	•	Backend: Python · FastAPI · Uvicorn · httpx · asyncio

## ▶️ Getting Started

### Backend
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