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
    queryFn: async () => {
      const data = await getJobStatus(jobId);

      const completedCount = data?.results.filter(
        (r) => r.status === "completed"
      ).length;
      const failedCount = data?.results.filter(
        (r) => r.status === "failed"
      ).length;

      if (data?.status === "completed") {
        toast({
          title: "Generation Complete!",
          description: `Successfully generated ${completedCount} images${
            failedCount > 0 ? ` (${failedCount} failed)` : ""
          }. Check metrics below for timing details.`,
          variant: "default",
        });
      } else if (data?.status === "failed") {
        toast({
          title: "Generation Failed",
          description: `Generation failed after completing ${completedCount} images. Please check the results and try again.`,
          variant: "destructive",
        });
      }

      return data;
    },
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
      if (!data || data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return DEFAULT_POLLING_INTERVAL;
    },
  });
};
