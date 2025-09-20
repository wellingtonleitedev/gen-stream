import { toast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { GenerationForm } from "./generation-form";
import { ImageResultsGrid } from "./image-results";
import { useGetJobStatus } from "../api/get-job-status";
import { useGenerateImages } from "../api/generate-images";
import { GenerationProgress } from "./generation-progress";

import type { GenerateRequest } from "../types";

export function GenerationFlow() {
  const queryClient = useQueryClient();
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  const onGenerateComplete = (jobId: string) => {
    setCurrentJobId(jobId);
  };

  const { mutateAsync: generateImages, isPending: isGenerating } =
    useGenerateImages(onGenerateComplete);

  const { data: jobStatus } = useGetJobStatus({ jobId: currentJobId || "" });

  const handleGenerate = async (data: GenerateRequest) => {
    await generateImages(data);
  };

  const handleNewGeneration = () => {
    setCurrentJobId(null);
    queryClient.invalidateQueries({ queryKey: ["get-job-status"] });
  };

  useEffect(() => {
    if (jobStatus?.status) {
      if (jobStatus.status === "completed") {
        const completedCount = jobStatus.results.filter(
          (r) => r.status === "completed"
        ).length;
        toast({
          title:
            jobStatus.status === "completed"
              ? "Generation Complete!"
              : "Generation Failed",
          description:
            jobStatus.status === "completed"
              ? `Successfully generated ${completedCount} images.`
              : `Generation failed. ${completedCount} images completed successfully.`,
          variant: jobStatus.status === "completed" ? "default" : "destructive",
        });
      }
    }
  }, [jobStatus?.status, jobStatus?.results]);

  return (
    <div className="space-y-6">
      {!currentJobId ? (
        <GenerationForm onSubmit={handleGenerate} isGenerating={isGenerating} />
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Generation in Progress</h2>
            <button
              onClick={handleNewGeneration}
              className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              New Generation
            </button>
          </div>

          {jobStatus && (
            <>
              <GenerationProgress jobStatus={jobStatus} />

              {jobStatus.results.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Results</h3>
                  <ImageResultsGrid items={jobStatus.results} />
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
