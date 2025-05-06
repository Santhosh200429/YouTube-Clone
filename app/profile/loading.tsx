import { Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container py-8">
      <div className="flex flex-col md:flex-row gap-8 items-start">
        {/* Profile sidebar skeleton */}
        <div className="w-full md:w-64 flex flex-col items-center">
          <Skeleton className="h-32 w-32 rounded-full mb-4" />
          <Skeleton className="h-6 w-32 mb-2" />
          <Skeleton className="h-4 w-48 mb-4" />
          <Skeleton className="h-9 w-full" />
        </div>

        {/* Profile content skeleton */}
        <div className="flex-1">
          <Skeleton className="h-10 w-full mb-6" />

          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <div className="flex justify-end">
              <Skeleton className="h-10 w-32" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
