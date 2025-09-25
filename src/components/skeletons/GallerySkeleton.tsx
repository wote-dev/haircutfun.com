"use client";

import { Skeleton } from "@/components/ui/skeleton";

interface GallerySkeletonProps {
  count?: number;
  showSearch?: boolean;
  showFilters?: boolean;
}

export function GallerySkeleton({ 
  count = 6, 
  showSearch = true, 
  showFilters = true 
}: GallerySkeletonProps) {
  return (
    <div className="space-y-6">
      {/* Search and Filters Skeleton */}
      {(showSearch || showFilters) && (
        <div className="space-y-4">
          {showSearch && (
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <Skeleton className="h-10 w-full sm:w-80" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-20" />
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          )}
          
          {showFilters && (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 sm:w-20" />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Gallery Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="space-y-3">
            {/* Image Skeleton */}
            <Skeleton className="aspect-[3/4] w-full rounded-lg" />
            
            {/* Title and Description Skeleton */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}