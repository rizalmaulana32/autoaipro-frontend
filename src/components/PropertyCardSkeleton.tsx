import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

export function PropertyCardSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-3/4" />
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-14" />
            <Skeleton className="h-4 w-16" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-18" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
