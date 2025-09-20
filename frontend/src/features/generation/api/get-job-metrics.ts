import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import type { JobMetrics } from "../types";

async function getJobMetrics(jobId: string): Promise<JobMetrics> {
  const response = await api.get(`/generate/${jobId}/metrics`);
  return response.data;
}

export function useGetJobMetrics(jobId: string, enabled = true) {
  return useQuery({
    enabled: enabled && !!jobId,
    queryKey: ["job-metrics", jobId],
    queryFn: () => getJobMetrics(jobId),
  });
}
