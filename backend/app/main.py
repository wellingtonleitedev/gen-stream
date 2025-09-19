from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from .sse import sse_headers, job_progress_stream
from .models import GenerateRequest, GenerateResponse, Job
from .store import job_store
from .runner import job_runner

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
    
    await job_runner.start_job(job.id)
    
    return GenerateResponse(job_id=job.id)

@app.get("/api/generate/{job_id}")
async def get_generation_job(job_id: str):
    job = await job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return job


@app.get("/api/generate/{job_id}/stream")
async def stream_job_progress(job_id: str):
    # Check if job exists
    job = await job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return StreamingResponse(job_progress_stream(job_id), headers=sse_headers())


@app.get("/api/generate/{job_id}/metrics")
async def get_job_metrics(job_id: str):
    job = await job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": job_id,
        "status": job.status,
        "ttfi_ms": job.ttfi_ms,
        "total_ms": job.total_ms,
        "completed_count": sum(1 for r in job.results if r.status == "completed"),
        "failed_count": sum(1 for r in job.results if r.status == "failed"),
        "total_count": len(job.results)
    }
