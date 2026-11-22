import { Skeleton } from '@/components/skeleton'

export default function ProgramPlanSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-4">
      <span className="sr-only">Cargando plan de estudios…</span>

      <div aria-hidden="true" className="card space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-9 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {[0, 1, 2].map((i) => (
        <div key={i} aria-hidden="true" className="card overflow-hidden">
          <div className="border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
            <Skeleton className="h-4 w-24" />
          </div>
          {[0, 1].map((j) => (
            <div key={j} className="flex items-center gap-3 px-4 py-3 sm:px-6">
              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-4 w-56 max-w-full" />
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}