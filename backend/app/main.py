from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .sse import sse_headers, demo_event_stream
from .models import GenerateRequest, GenerateResponse, Job
from .store import job_store

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}

@app.post("/api/generate", response_model=GenerateResponse)
async def create_generation_job(request: GenerateRequest):
    job = Job(prompt=request.prompt, num_images=request.num_images)
    await job_store.create_job(job)
    return GenerateResponse(job_id=job.id)

@app.get("/api/generate/{job_id}")
async def get_generation_job(job_id: str):
    job = await job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job
