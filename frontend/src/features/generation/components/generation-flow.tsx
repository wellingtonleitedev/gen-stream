import { useQueryClient } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";

import { GenerationForm } from "./generation-form";
import { MetricsDisplay } from "./metrics-display";
import { ImageResultsGrid } from "./image-results";
import { ImageGridSkeleton } from "./image-skeleton";
import { useGetJobStatus } from "../api/get-job-status";
import { useGenerateImages } from "../api/generate-images";
import { GenerationProgress } from "./generation-progress";

import type { GenerateRequest } from "../types";

export function GenerationFlow() {
  const queryClient = useQueryClient();

  const {
    data,
    reset,
    mutateAsync: generateImages,
    isPending: isGenerating,
  } = useGenerateImages();

  const { data: jobStatus } = useGetJobStatus(data?.job_id || "");

  const handleGenerate = async (data: GenerateRequest) => {
    await generateImages(data);
  };

  const handleNewGeneration = () => {
    reset();
    queryClient.invalidateQueries({ queryKey: ["job-metrics"] });
    queryClient.invalidateQueries({ queryKey: ["get-job-status"] });
  };

  return (
    <div className="space-y-8">
      {!data?.job_id ? (
        <div>
          <h1 className="text-3xl font-bold mb-6">Generate Images</h1>
          <GenerationForm
            onSubmit={handleGenerate}
            isGenerating={isGenerating}
          />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Generation in Progress</h2>
            <Button
              onClick={handleNewGeneration}
              variant="outline"
              size="sm"
              aria-label="Start a new image generation"
            >
              New Generation
            </Button>
          </div>

          {jobStatus && (
            <>
              <GenerationProgress jobStatus={jobStatus} />

              {jobStatus.status === "completed" && data?.job_id && (
                <MetricsDisplay
                  jobId={data.job_id}
                  isCompleted={jobStatus.status === "completed"}
                />
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Results</h3>
                  {jobStatus.status === "completed" && (
                    <div className="text-sm text-muted-foreground">
                      {
                        jobStatus.results.filter(
                          (r) => r.status === "completed"
                        ).length
                      }{" "}
                      of {jobStatus.results.length} completed
                    </div>
                  )}
                </div>

                {jobStatus.results.length ? (
                  <ImageResultsGrid items={jobStatus.results} />
                ) : (
                  <ImageGridSkeleton count={4} />
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
