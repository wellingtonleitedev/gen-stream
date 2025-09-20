import type { JobItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

interface ImageResultProps {
  item: JobItem;
  index: number;
  className?: string;
}

export function ImageResult({ item, index, className }: ImageResultProps) {
  const statusColors = {
    running: "bg-blue-500",
    completed: "bg-green-500",
    failed: "bg-red-500",
  };

  return (
    <Card className={className}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium">Image #{index + 1}</span>
          <Badge
            variant="secondary"
            className={`${
              statusColors[item.status] || "bg-gray-500"
            } text-white text-xs capitalize`}
          >
            {item.status}
          </Badge>
        </div>

        {item.status === "running" && (
          <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        )}

        {item.status === "completed" && item.url && (
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={item.url}
              alt={`Generated image ${index + 1}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}

        {item.status === "failed" && (
          <div className="aspect-square bg-red-50 rounded-lg flex flex-col items-center justify-center p-4">
            <div className="text-red-500 text-center">
              <div className="text-lg mb-2">✕</div>
              <div className="text-sm">Failed to generate</div>
              {item.error && (
                <div className="text-xs text-red-400 mt-1">{item.error}</div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

interface ImageResultsGridProps {
  items: JobItem[];
  className?: string;
}

export function ImageResultsGrid({ items, className }: ImageResultsGridProps) {
  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ${className}`}
    >
      {items.map((item, index) => (
        <ImageResult key={item.id} item={item} index={index} />
      ))}
    </div>
  );
}
