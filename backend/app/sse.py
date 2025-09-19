import asyncio
import json
import time
from typing import AsyncGenerator

from .store import job_store
from .models import JobStatus


def sse_headers() -> dict:
    """Return proper SSE headers"""
    return {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
    }


async def job_progress_stream(job_id: str) -> AsyncGenerator[bytes, None]:
    """Stream job progress events as items complete"""
    # Track which results we've already reported
    reported_results = set()
    last_keep_alive = time.time()
    
    while True:
        current_time = time.time()
        
        # Send keep-alive comment every 10 seconds
        if current_time - last_keep_alive > 10:
            yield b": keep-alive\n\n"
            last_keep_alive = current_time
        
        job = await job_store.get_job(job_id)
        if not job:
            # Job not found - end stream
            break
            
        # Check for newly completed results
        for i, result in enumerate(job.results):
            if i not in reported_results and result.status != "running":
                # New completed result - send progress event
                event_data = {
                    "index": i,
                    "status": result.status,
                    "url": result.url,
                    "error": result.error
                }
                
                progress_event = f'event: progress\ndata: {json.dumps(event_data)}\n\n'
                yield progress_event.encode()
                reported_results.add(i)
        
        # Check if job is complete
        if job.status in [JobStatus.COMPLETED, JobStatus.FAILED]:
            # Send final done event with metrics
            done_data = {
                "status": job.status,
                "total_ms": job.total_ms,
                "ttfi_ms": job.ttfi_ms,
                "completed_count": sum(1 for r in job.results if r.status == "completed"),
                "failed_count": sum(1 for r in job.results if r.status == "failed")
            }
            
            done_event = f'event: done\ndata: {json.dumps(done_data)}\n\n'
            yield done_event.encode()
            break
        
        # Wait a bit before checking again
        await asyncio.sleep(0.5)