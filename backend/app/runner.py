import asyncio
import random
from datetime import datetime
from typing import Dict, Any, Tuple
import os

from .models import Job, JobStatus, ResultStatus
from .store import job_store


class JobRunner:
    def __init__(self, max_concurrency: int = None, max_retries: int = None):
        if max_concurrency is None:
            max_concurrency = int(os.getenv("MAX_CONCURRENCY", "5"))
        if max_retries is None:
            max_retries = int(os.getenv("MAX_RETRIES", "3"))
        
        self.semaphore = asyncio.Semaphore(max_concurrency)
        self.max_retries = max_retries
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
        """Process a single image generation task with retry logic"""
        async with self.semaphore:
            last_error = None
            
            for attempt in range(self.max_retries):
                try:
                    success, error_msg = await self._simulate_generation_task()
                    
                    if success:
                        completion_time = datetime.utcnow()
                        await self._update_result_success(job_id, index, completion_time)
                        return completion_time
                    else:
                        last_error = error_msg
                        
                        if attempt == self.max_retries - 1:
                            await self._update_result_failure(job_id, index, last_error)
                            break
                        
                        base_delay = 2 ** attempt
                        jitter = random.uniform(0.1, 0.3)
                        delay = base_delay + jitter
                        await asyncio.sleep(delay)
                        
                except Exception as e:
                    last_error = f"Unexpected error: {str(e)}"
                    if attempt == self.max_retries - 1:
                        await self._update_result_failure(job_id, index, last_error)
                        break
                    
                    base_delay = 2 ** attempt
                    jitter = random.uniform(0.1, 0.3) 
                    delay = base_delay + jitter
                    await asyncio.sleep(delay)
            
            return datetime.utcnow()

    async def _simulate_generation_task(self) -> Tuple[bool, str]:
        """Simulate image generation with variable latency and failure rate"""
        delay = random.uniform(1.0, 5.0)
        await asyncio.sleep(delay)
        
        success = random.random() > 0.2
        error_msg = "Simulated generation failure" if not success else None
        
        return success, error_msg

    async def _update_result_success(self, job_id: str, index: int, completion_time: datetime):
        """Update job result for successful completion"""
        job = await job_store.get_job(job_id)
        if job and index < len(job.results):
            job.results[index].status = ResultStatus.COMPLETED
            job.results[index].url = f"https://example.com/image_{job_id}_{index}.jpg"
            job.results[index].error = None
            await job_store.update_job(job)

    async def _update_result_failure(self, job_id: str, index: int, error_msg: str):
        """Update job result for failure after all retries"""
        job = await job_store.get_job(job_id)
        if job and index < len(job.results):
            job.results[index].status = ResultStatus.FAILED
            job.results[index].url = None
            job.results[index].error = error_msg
            await job_store.update_job(job)

job_runner = JobRunner()