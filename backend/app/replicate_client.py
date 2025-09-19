import asyncio
import os
from typing import Optional, Tuple
import httpx
import json
from datetime import datetime


class ReplicateClient:
    def __init__(self):
        self.api_token = os.getenv("REPLICATE_API_TOKEN")
        self.model = os.getenv("REPLICATE_MODEL", "stability-ai/stable-diffusion")
        self.model_version = os.getenv("REPLICATE_MODEL_VERSION")
        self.base_url = "https://api.replicate.com/v1"
        self.timeout = httpx.Timeout(30.0, connect=10.0)
        self._initialized = False
        
    def _ensure_initialized(self):
        """Lazy initialization to check for API token only when actually needed"""
        if not self._initialized:
            if not self.api_token:
                raise ValueError("REPLICATE_API_TOKEN environment variable is required")
            self._initialized = True

    async def generate_image(self, prompt: str) -> Tuple[bool, Optional[str], Optional[str]]:
        """
        Generate a single image using Replicate API.
        Returns: (success, image_url, error_message)
        """
        self._ensure_initialized()
        
        try:
            prediction_id = await self._create_prediction(prompt)
            if not prediction_id:
                return False, None, "Failed to create prediction"
            
            result = await self._poll_prediction(prediction_id)
            
            if result["status"] == "succeeded":
                image_url = self._extract_image_url(result["output"])
                if image_url:
                    return True, image_url, None
                else:
                    return False, None, "No valid image URL in prediction output"
            else:
                error_msg = result.get("error", f"Prediction failed with status: {result['status']}")
                return False, None, error_msg
                
        except Exception as e:
            error_msg = str(e).replace(self.api_token or "", "[REDACTED]")
            return False, None, f"Replicate API error: {error_msg}"

    async def _create_prediction(self, prompt: str) -> Optional[str]:
        """Create a prediction and return the prediction ID"""
        self._ensure_initialized()
        
        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        input_data = {"prompt": prompt}
        
        if self.model_version:
            url = f"{self.base_url}/predictions"
            payload = {
                "version": self.model_version,
                "input": input_data
            }
        else:
            url = f"{self.base_url}/predictions" 
            payload = {
                "model": self.model,
                "input": input_data
            }

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(url, headers=headers, json=payload)
            response.raise_for_status()
            
            result = response.json()
            return result.get("id")

    async def _poll_prediction(self, prediction_id: str, max_wait_time: int = 300) -> dict:
        """Poll prediction status until completion or timeout"""
        self._ensure_initialized()
        
        headers = {
            "Authorization": f"Token {self.api_token}",
            "Content-Type": "application/json"
        }
        
        url = f"{self.base_url}/predictions/{prediction_id}"
        start_time = datetime.utcnow()
        
        async with httpx.AsyncClient(timeout=self.timeout) as client:
            while True:
                response = await client.get(url, headers=headers)
                response.raise_for_status()
                
                result = response.json()
                status = result.get("status")
                
                if status in ["succeeded", "failed", "canceled"]:
                    return result
                
                elapsed = (datetime.utcnow() - start_time).total_seconds()
                if elapsed > max_wait_time:
                    return {
                        "status": "failed",
                        "error": f"Prediction timed out after {max_wait_time} seconds"
                    }
                
                if elapsed < 30:
                    wait_time = 1.0
                elif elapsed < 120:
                    wait_time = 2.0
                else:
                    wait_time = 5.0
                    
                await asyncio.sleep(wait_time)

    def _extract_image_url(self, output) -> Optional[str]:
        """Extract the first valid image URL from prediction output"""
        if not output:
            return None
            
        if isinstance(output, str):
            return output if output.startswith(("http://", "https://")) else None
        elif isinstance(output, list) and len(output) > 0:
            first_item = output[0]
            if isinstance(first_item, str) and first_item.startswith(("http://", "https://")):
                return first_item
        elif isinstance(output, dict):
            for key in ["url", "image", "output", "result"]:
                if key in output:
                    url = output[key]
                    if isinstance(url, str) and url.startswith(("http://", "https://")):
                        return url
        
        return None

replicate_client = ReplicateClient()