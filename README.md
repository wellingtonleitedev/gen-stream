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
	•	Frontend: React · TailwindCSS · shadcn · React Query · React Hook Form · Zod

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

3. Copy environment file:
```bash
cp .env.example .env
# Edit the .env file and configure
```

4. Run the server:
```bash
uvicorn app.main:app --reload --port 8080
```

### Frontend

**Prerequisites**
- Node.js 18+ (install from [nodejs.org](https://nodejs.org) or use `nvm install node`)
- pnpm (install with `npm install -g pnpm` or see [pnpm.io](https://pnpm.io/installation))
- Backend server running

1. Install dependencies:
```bash
cd frontend
pnpm install
```

2. Copy environment file:
```bash
cp .env.example .env.local
```

3. Start development server:
```bash
pnpm dev
```

Open http://localhost:5173 in your browser