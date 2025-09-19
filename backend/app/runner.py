import asyncio
import random
from datetime import datetime
from typing import Dict, Any
import os

from .models import Job, JobStatus, ResultStatus
from .store import job_store


class JobRunner:
    def __init__(self, max_concurrency: int = None):
        if max_concurrency is None:
            max_concurrency = int(os.getenv("MAX_CONCURRENCY", "5"))
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self._running_jobs: Dict[str, asyncio.Task] = {}

    async def start_job(self, job_id: str) -> None:
        """Start processing a job in the background"""
        if job_id in self._running_jobs:
            return
        
        task = asyncio.create_task(self._process_job(job_id))
        self._running_jobs[job_id] = task
        
        def cleanup(task):
            self._running_jobs.pop(job_id, None)
        task.add_done_callback(cleanup)

    async def _process_job(self, job_id: str) -> None:
        """Process all image generation tasks for a job"""
        job = await job_store.get_job(job_id)
        if not job:
            return

        job.status = JobStatus.RUNNING
        job_start_time = datetime.utcnow()
        await job_store.update_job(job)

        first_item_finished_time = None
        
        tasks = []
        for i in range(job.num_images):
            task = asyncio.create_task(self._process_single_image(job_id, i))
            tasks.append(task)

        try:
            results = await asyncio.gather(*tasks, return_exceptions=True)
            
            for i, result in enumerate(results):
                if not isinstance(result, Exception):
                    completion_time = result
                    if first_item_finished_time is None or completion_time < first_item_finished_time:
                        first_item_finished_time = completion_time

            job = await job_store.get_job(job_id)
            if job:
                job_end_time = datetime.utcnow()
                
                failed_count = sum(1 for result in job.results if result.status == ResultStatus.FAILED)
                
                if failed_count == len(job.results):
                    job.status = JobStatus.FAILED
                else:
                    job.status = JobStatus.COMPLETED

                total_ms = int((job_end_time - job_start_time).total_seconds() * 1000)
                ttfi_ms = None
                if first_item_finished_time:
                    ttfi_ms = int((first_item_finished_time - job_start_time).total_seconds() * 1000)

                job.total_ms = total_ms
                job.ttfi_ms = ttfi_ms
                
                await job_store.update_job(job)

        except Exception as e:
            job = await job_store.get_job(job_id)
            if job:
                job.status = JobStatus.FAILED
                await job_store.update_job(job)

    async def _process_single_image(self, job_id: str, index: int) -> datetime:
        """Process a single image generation task"""
        async with self.semaphore:
            delay = random.uniform(1.0, 5.0)
            await asyncio.sleep(delay)
            
            success = random.random() > 0.1
            
            job = await job_store.get_job(job_id)
            if job and index < len(job.results):
                completion_time = datetime.utcnow()
                
                if success:
                    job.results[index].status = ResultStatus.COMPLETED
                    job.results[index].url = f"https://example.com/image_{job_id}_{index}.jpg"
                    job.results[index].error = None
                else:
                    job.results[index].status = ResultStatus.FAILED
                    job.results[index].url = None
                    job.results[index].error = "Simulated generation failure"
                
                await job_store.update_job(job)
                return completion_time
            
            return datetime.utcnow()

job_runner = JobRunner()