import { Skeleton } from '@/components/skeleton'

function ListCardSkeleton() {
  return (
    <div className="card space-y-4 p-4 sm:p-6">
      <Skeleton className="h-5 w-36" />
      {Array.from({ length: 3 }, (_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-4 w-48 max-w-full" />
        </div>
      ))}
    </div>
  )
}

export default function CourseDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Cargando curso…</span>

      <div aria-hidden="true" className="card space-y-3 p-4 sm:p-6">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-8 w-72 max-w-full" />
        <Skeleton className="h-4 w-44" />
      </div>

      <div aria-hidden="true" className="card space-y-4 p-4 sm:p-6">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>
    </div>
  )
}