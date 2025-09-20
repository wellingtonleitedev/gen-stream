import { z } from "zod";
import type { generateSchema } from "./schemas";

export type GenerateRequest = z.infer<typeof generateSchema>;

export interface GenerateResponse {
  job_id: string;
  status: string;
}

export interface JobItem {
  id: string;
  status: "running" | "completed" | "failed";
  url?: string;
  error?: string;
}

export interface JobStatus {
  id: string;
  prompt: string;
  num_images: number;
  status: "pending" | "running" | "completed" | "failed";
  created_at: string;
  results: JobItem[];
  total_ms?: number;
  ttfi_ms?: number;
}
