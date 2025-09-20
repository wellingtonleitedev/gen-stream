import asyncio
import json
import jwt
from datetime import datetime
from typing import Set
from fastapi import WebSocket, WebSocketDisconnect, HTTPException
from .store import job_store
from .models import JobStatus


class WebSocketManager:
    def __init__(self):
        self.active_connections: dict[str, Set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = set()
        self.active_connections[job_id].add(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].discard(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]

    async def send_to_job_connections(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            disconnected = set()
            for websocket in self.active_connections[job_id]:
                try:
                    await websocket.send_text(json.dumps(message))
                except:
                    disconnected.add(websocket)
            
            for ws in disconnected:
                self.active_connections[job_id].discard(ws)


ws_manager = WebSocketManager()


def verify_websocket_token(token: str) -> bool:
    """Verify JWT token for WebSocket authentication"""
    try:
        import os
        secret = os.getenv("AUTH_SECRET", "your-secret-key-change-in-production")
        payload = jwt.decode(token, secret, algorithms=["HS256"])
        return True
    except:
        return False


async def websocket_job_stream(websocket: WebSocket, job_id: str):
    """Stream job progress via WebSocket with same payload as SSE"""
  
    reported_results = set()
    
    try:
        while True:
            job = await job_store.get_job(job_id)
            if not job:
                await websocket.close(code=1000, reason="Job not found")
                break
                
            for i, result in enumerate(job.results):
                if i not in reported_results and result.status != "running":
                    progress_data = {
                        "type": "progress",
                        "payload": {
                            "index": i,
                            "status": result.status,
                            "url": result.url,
                            "error": result.error,
                            "started_at": job.created_at.isoformat() if job.created_at else None,
                            "finished_at": datetime.utcnow().isoformat()
                        }
                    }
                    
                    await websocket.send_text(json.dumps(progress_data))
                    reported_results.add(i)
            
            if job.status in [JobStatus.COMPLETED, JobStatus.FAILED]:
                done_data = {
                    "type": "done",
                    "payload": {
                        "status": job.status,
                        "total_ms": job.total_ms,
                        "ttfi_ms": job.ttfi_ms,
                        "completed_count": sum(1 for r in job.results if r.status == "completed"),
                        "failed_count": sum(1 for r in job.results if r.status == "failed")
                    }
                }
                
                await websocket.send_text(json.dumps(done_data))
                await websocket.close(code=1000, reason="Job completed")
                break
            
            try:
                await websocket.ping()
            except:
                break
                
            await asyncio.sleep(0.5)
            
    except WebSocketDisconnect:
        pass
    except Exception as e:
        await websocket.close(code=1011, reason=f"Internal error: {str(e)}")