import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import type { JobStatus } from "../types";

const DEFAULT_POLLING_INTERVAL = 2000; // 2 seconds

const getJobStatus = async (jobId: string): Promise<JobStatus> => {
  const response = await api.get(`/generate/${jobId}`);
  return response.data;
};

export const useGetJobStatus = (jobId: string) => {
  return useQuery({
    enabled: !!jobId,
    queryKey: ["get-job-status", jobId],
    queryFn: async () => await getJobStatus(jobId),
    retry: (failureCount) => failureCount < 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff up to 30s
    throwOnError: (error) => {
      toast({
        title: "Error",
        variant: "destructive",
        description: "Failed to get job status: " + error.message,
      });
      return true;
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data || data.status === "completed" || data.status === "failed") {
        return false;
      }
      return DEFAULT_POLLING_INTERVAL;
    },
  });
};
