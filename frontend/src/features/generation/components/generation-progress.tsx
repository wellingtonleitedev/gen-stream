import type { JobStatus } from "../types";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface GenerationProgressProps {
  jobStatus: JobStatus;
  className?: string;
}

export function GenerationProgress({
  jobStatus,
  className,
}: GenerationProgressProps) {
  const status: Record<string, { color: string; text: string }> = {
    pending: { color: "bg-yellow-500", text: "Pending" },
    running: { color: "bg-blue-500", text: "Generating..." },
    completed: { color: "bg-green-500", text: "Completed" },
    failed: { color: "bg-red-500", text: "Failed" },
  };

  // Calculate progress based on completed results
  const completedCount = jobStatus.results.filter(
    (r) => r.status === "completed"
  ).length;
  const failedCount = jobStatus.results.filter(
    (r) => r.status === "failed"
  ).length;
  const totalProcessed = completedCount + failedCount;
  const progressValue =
    jobStatus.results.length > 0
      ? Math.round((totalProcessed / jobStatus.results.length) * 100)
      : 0;

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Generation Progress</CardTitle>
          <Badge
            variant="secondary"
            className={`${status[jobStatus.status]?.color} text-white`}
          >
            {status[jobStatus.status]?.text || "Unknown"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Progress</span>
            <span>{progressValue}%</span>
          </div>
          <Progress value={progressValue} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Completed:</span>
            <span className="ml-2 font-medium text-green-600">
              {completedCount}
            </span>
          </div>
          <div>
            <span className="text-muted-foreground">Failed:</span>
            <span className="ml-2 font-medium text-red-600">{failedCount}</span>
          </div>
        </div>

        <div className="text-sm text-muted-foreground">
          Processing {jobStatus.results.length} image
          {jobStatus.results.length !== 1 ? "s" : ""}
        </div>
      </CardContent>
    </Card>
  );
}
