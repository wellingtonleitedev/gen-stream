from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from dotenv import load_dotenv
from .sse import sse_headers, job_progress_stream
from .websocket import websocket_job_stream, verify_websocket_token, ws_manager
from .models import GenerateRequest, GenerateResponse, Job
from .store import job_store
from .runner import job_runner
from .auth import auth_service, get_current_user, LoginRequest, LoginResponse

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/health")
async def health():
    return {"status": "ok"}


@app.post("/api/auth/login", response_model=LoginResponse)
async def login(request: LoginRequest):
    """Authenticate user and return access token"""
    return await auth_service.login(request)


@app.post("/api/generate", response_model=GenerateResponse)
async def create_generation_job(request: GenerateRequest, current_user: str = Depends(get_current_user)):
    job = Job(prompt=request.prompt, num_images=request.num_images)
    await job_store.create_job(job)
    
    await job_runner.start_job(job.id)
    
    return GenerateResponse(job_id=job.id)


@app.get("/api/generate/{job_id}/stream")
async def stream_job_progress(job_id: str, current_user: str = Depends(get_current_user)):
    job = await job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return StreamingResponse(job_progress_stream(job_id), headers=sse_headers())


@app.websocket("/api/generate/{job_id}")
async def websocket_job_progress(websocket: WebSocket, job_id: str, token: str = Query(...)):
    """WebSocket endpoint for job progress with token-based auth"""
    if not verify_websocket_token(token):
        await websocket.close(code=1008, reason="Invalid token")
        return
    
    job = await job_store.get_job(job_id)
    if not job:
        await websocket.close(code=1000, reason="Job not found")
        return
    
    await ws_manager.connect(websocket, job_id)
    
    try:
        await websocket_job_stream(websocket, job_id)
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(websocket, job_id)


@app.get("/api/generate/{job_id}/metrics")
async def get_job_metrics(job_id: str, current_user: str = Depends(get_current_user)):
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


@app.get("/api/generate/{job_id}")
async def get_job_results(job_id: str, current_user: str = Depends(get_current_user)):
    """Polling endpoint to get current job results without SSE"""
    job = await job_store.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return {
        "job_id": job_id,
        "status": job.status,
        "results": [
            {
                "id": result.id,
                "status": result.status,
                "url": result.url,
                "error": result.error
            }
            for result in job.results
        ],
        "progress": {
            "completed": sum(1 for r in job.results if r.status == "completed"),
            "failed": sum(1 for r in job.results if r.status == "failed"), 
            "running": sum(1 for r in job.results if r.status == "running"),
            "total": len(job.results)
        }
    }
