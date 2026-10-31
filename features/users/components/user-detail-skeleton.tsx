import { Skeleton } from '@/components/skeleton'

function CardSkeleton({ rows }: { rows: number }) {
  return (
    <div className="card space-y-4 p-4 sm:p-6">
      <Skeleton className="h-5 w-36" />
      <div className="grid gap-4 sm:grid-cols-2">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-4 w-40 max-w-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

export default function UserDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Cargando usuario…</span>

      <div aria-hidden="true" className="card flex items-center gap-4 p-4 sm:p-6">
        <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-56 max-w-full" />
          <Skeleton className="h-4 w-44 max-w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-5 w-20 rounded-full" />
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>
      </div>

      <div aria-hidden="true" className="grid gap-6 lg:grid-cols-2">
        <CardSkeleton rows={4} />
        <CardSkeleton rows={4} />
      </div>
      <div aria-hidden="true">
        <CardSkeleton rows={3} />
      </div>
    </div>
  )
}