"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

interface CardSkeletonProps {
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
  className?: string;
}

export function CardSkeleton({ 
  showHeader = true, 
  showFooter = false, 
  contentLines = 3,
  className 
}: CardSkeletonProps) {
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-full" />
        </CardHeader>
      )}
      
      <CardContent className="space-y-3">
        {Array.from({ length: contentLines }).map((_, i) => (
          <Skeleton 
            key={i} 
            className={`h-4 ${i === contentLines - 1 ? 'w-2/3' : 'w-full'}`} 
          />
        ))}
      </CardContent>
      
      {showFooter && (
        <div className="p-6 pt-0">
          <Skeleton className="h-10 w-full" />
        </div>
      )}
    </Card>
  );
}

interface CardGridSkeletonProps {
  count?: number;
  columns?: 1 | 2 | 3 | 4;
  showHeader?: boolean;
  showFooter?: boolean;
  contentLines?: number;
}

export function CardGridSkeleton({ 
  count = 3, 
  columns = 3,
  showHeader = true,
  showFooter = false,
  contentLines = 3
}: CardGridSkeletonProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
  };

  return (
    <div className={`grid ${gridCols[columns]} gap-4 sm:gap-6`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton
          key={i}
          showHeader={showHeader}
          showFooter={showFooter}
          contentLines={contentLines}
        />
      ))}
    </div>
  );
}