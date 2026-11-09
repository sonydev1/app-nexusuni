import { Skeleton } from '@/components/skeleton'

export default function ProgramDetailSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Cargando carrera…</span>

      <div aria-hidden="true" className="card space-y-3 p-4 sm:p-6">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-24 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-8 w-80 max-w-full" />
        <Skeleton className="h-4 w-48" />
      </div>

      <div aria-hidden="true" className="card space-y-4 p-4 sm:p-6">
        <Skeleton className="h-5 w-40" />
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-4 w-40 max-w-full" />
            </div>
          ))}
        </div>
      </div>

      <Skeleton aria-hidden="true" className="h-48 w-full rounded-xl" />
    </div>
  )
}