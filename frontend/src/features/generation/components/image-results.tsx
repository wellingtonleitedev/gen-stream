import type { JobItem } from "../types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < array.length; index += chunkSize) {
    chunks.push(array.slice(index, index + chunkSize));
  }
  return chunks;
}

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
          <div
            className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center"
            aria-label={`Image ${index + 1} is currently being generated`}
            role="img"
          >
            <div
              className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full"
              aria-hidden="true"
            ></div>
            <span className="sr-only">Loading image {index + 1}</span>
          </div>
        )}

        {item.status === "completed" && item.url && (
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={item.url}
              alt={`Generated image ${index + 1} from the prompt`}
              className="w-full h-full object-cover focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              loading="lazy"
              tabIndex={0}
            />
          </div>
        )}

        {item.status === "failed" && (
          <div
            className="aspect-square bg-red-50 rounded-lg flex flex-col items-center justify-center p-4"
            role="alert"
            aria-label={`Image ${index + 1} failed to generate`}
          >
            <div className="text-red-500 text-center">
              <div className="text-lg mb-2" aria-hidden="true">
                ✕
              </div>
              <div className="text-sm">Failed to generate</div>
              {item.error && (
                <div className="text-xs text-red-400 mt-1" role="status">
                  {item.error}
                </div>
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
  imagesPerRow?: number;
}

export function ImageResultsGrid({
  items,
  imagesPerRow = 5,
}: ImageResultsGridProps) {
  const rows =
    items.length > imagesPerRow ? chunkArray(items, imagesPerRow) : [items];

  return (
    <div className="space-y-6">
      {rows.map((rowItems, rowIndex) => (
        <div key={rowIndex} className="w-full">
          {rows.length > 1 && (
            <h3 className="mb-3 text-sm font-medium text-gray-600">
              {`(${rowItems.length} image${rowItems.length !== 1 ? "s" : ""})`}
            </h3>
          )}
          <Carousel className="w-full" opts={{ loop: true }}>
            <CarouselContent>
              {rowItems.map((item, index) => (
                <CarouselItem key={item.id} className="basis-full md:basis-1/3">
                  <ImageResult
                    item={item}
                    index={rowIndex * imagesPerRow + index}
                  />
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious className="hidden xl:flex" />
            <CarouselNext className="hidden xl:flex" />
          </Carousel>
        </div>
      ))}
    </div>
  );
}
