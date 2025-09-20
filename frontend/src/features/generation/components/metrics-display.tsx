import { Clock, Timer } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useGetJobMetrics } from "../api/get-job-metrics";

interface MetricsDisplayProps {
  jobId: string;
  isCompleted: boolean;
}

export function MetricsDisplay({ jobId, isCompleted }: MetricsDisplayProps) {
  const { data: metrics, isLoading } = useGetJobMetrics(jobId, isCompleted);

  if (!isCompleted || isLoading || !metrics) {
    return null;
  }

  const formatTime = (ms?: number) => {
    if (!ms) return "N/A";
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Timer className="h-4 w-4" />
          Generation Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            Time to First Image
          </div>
          <span className="text-sm font-mono">
            {formatTime(metrics.ttfi_ms)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Timer className="h-3 w-3" />
            Total Time
          </div>
          <span className="text-sm font-mono">
            {formatTime(metrics.total_ms)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-2 border-t">
          <span className="text-sm text-muted-foreground">Success Rate</span>
          <span className="text-sm font-medium">
            {metrics.completed_count}/{metrics.total_count} (
            {Math.round((metrics.completed_count / metrics.total_count) * 100)}
            %)
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
