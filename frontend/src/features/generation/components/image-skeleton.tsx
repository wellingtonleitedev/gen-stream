import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function ImageSkeleton() {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-5 w-20" />
        </div>
        <Skeleton className="aspect-square w-full rounded-lg" />
      </CardContent>
    </Card>
  );
}

interface ImageGridSkeletonProps {
  count: number;
}

export function ImageGridSkeleton({ count }: ImageGridSkeletonProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }, (_, i) => (
        <ImageSkeleton key={i} />
      ))}
    </div>
  );
}
