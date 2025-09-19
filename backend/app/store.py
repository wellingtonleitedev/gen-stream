import asyncio
from typing import Dict, Optional

from .models import Job


class JobStore:
    def __init__(self):
        self._jobs: Dict[str, Job] = {}
        self._lock = asyncio.Lock()

    async def create_job(self, job: Job) -> Job:
        async with self._lock:
            self._jobs[job.id] = job
            return job

    async def get_job(self, job_id: str) -> Optional[Job]:
        async with self._lock:
            return self._jobs.get(job_id)

    async def update_job(self, job: Job) -> Job:
        async with self._lock:
            self._jobs[job.id] = job
            return job


# Global store instance
job_store = JobStore()