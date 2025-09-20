import { useMutation } from "@tanstack/react-query";

import api from "@/lib/api";
import type { GenerateRequest, GenerateResponse } from "../types";
import { toast } from "@/hooks/use-toast";

const generateImages = async (
  request: GenerateRequest
): Promise<GenerateResponse> => {
  const response = await api.post("/generate", request);
  return response.data;
};

export const useGenerateImages = (onSuccess: (jobId: string) => void) => {
  return useMutation({
    mutationKey: ["generate-images"],
    mutationFn: generateImages,
    onSuccess: (data) => {
      toast({
        title: "Generation Started",
        description: `Started generating images. Job ID: ${data.job_id}`,
      });
      onSuccess(data.job_id);
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description:
          error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    },
  });
};
