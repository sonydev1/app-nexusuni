import { cn } from '@/lib/utils'
import { Skeleton } from './skeleton'

/* ---------- Tarjetas de estadística ---------- */

export function StatCardsSkeleton({
  count = 4,
  icon = true,
  className,
}: {
  count?: number
  icon?: boolean // el dashboard lleva ícono; las tarjetas de roles no
  className?: string // define las columnas: "grid-cols-2 lg:grid-cols-4"
}) {
  return (
    <div aria-hidden="true" className={cn('grid gap-3 sm:gap-4', className)}>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="card flex items-start justify-between p-4 sm:p-5">
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-14" />
          </div>
          {icon && <Skeleton className="h-10 w-10 rounded-lg" />}
        </div>
      ))}
    </div>
  )
}

/* ---------- Tabla ---------- */

export type TableColumnSkeleton = {
  kind: 'user' | 'text' | 'badges' | 'actions'
  width?: string // solo para 'text'
}

function Cell({ column }: { column: TableColumnSkeleton }) {
  switch (column.kind) {
    case 'user':
      return (
        <div className="flex min-w-0 flex-[2] items-center gap-3">
          <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-4 w-32 max-w-full" />
            <Skeleton className="h-3 w-44 max-w-full" />
          </div>
        </div>
      )
    case 'badges':
      return (
        <div className="hidden flex-1 gap-1.5 sm:flex">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      )
    case 'actions':
      return <Skeleton className="h-8 w-8 shrink-0 rounded-md" />
    default:
      return (
        <div className="hidden flex-1 sm:block">
          <Skeleton className={cn('h-4', column.width ?? 'w-24')} />
        </div>
      )
  }
}

export function TableSkeleton({
  columns,
  rows = 8,
  toolbar = true,
  pagination = true,
  className,
}: {
  columns: TableColumnSkeleton[]
  rows?: number
  toolbar?: boolean // buscador + filtro
  pagination?: boolean
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('card overflow-hidden', className)}>
      {toolbar && (
        <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <Skeleton className="h-10 w-full rounded-lg sm:w-72" />
          <Skeleton className="h-10 w-full rounded-lg sm:w-48" />
        </div>
      )}

      {/* Encabezado de columnas */}
      <div className="flex items-center gap-4 border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        {columns.map((c, i) => (
          <div
            key={i}
            className={cn(
              c.kind === 'user' && 'flex-[2]',
              c.kind === 'actions' && 'w-8 shrink-0',
              c.kind !== 'user' && c.kind !== 'actions' && 'hidden flex-1 sm:block'
            )}
          >
            {c.kind !== 'actions' && <Skeleton className="h-3 w-16" />}
          </div>
        ))}
      </div>

      {Array.from({ length: rows }, (_, r) => (
        <div
          key={r}
          className="flex items-center gap-4 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800 sm:px-6"
        >
          {columns.map((c, i) => (
            <Cell key={i} column={c} />
          ))}
        </div>
      ))}

      {pagination && (
        <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
          <Skeleton className="h-4 w-20" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-9 rounded-md sm:w-24" />
            <Skeleton className="h-8 w-9 rounded-md sm:w-24" />
          </div>
        </div>
      )}
    </div>
  )
}

/* ---------- Paneles del dashboard ---------- */

// Lista con avatar (por ejemplo, "Últimos usuarios")
export function ListPanelSkeleton({
  rows = 6,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('card overflow-hidden', className)}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-4 w-20" />
      </div>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 last:border-0 dark:border-slate-800 sm:px-6"
        >
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-4 w-32 max-w-full" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      ))}
    </div>
  )
}

// Barras de progreso (por ejemplo, "Usuarios por rol")
export function BarsPanelSkeleton({
  rows = 4,
  className,
}: {
  rows?: number
  className?: string
}) {
  return (
    <div aria-hidden="true" className={cn('card p-4 sm:p-6', className)}>
      <Skeleton className="h-5 w-32" />
      <Skeleton className="mt-2 h-3 w-56 max-w-full" />
      <div className="mt-5 space-y-4">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="space-y-1.5">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-6" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}


export function PageSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6 p-4 md:p-8">
      <span className="sr-only">Cargando…</span>
      <div className="space-y-2">
        <Skeleton className="h-7 w-40" />
        <Skeleton className="h-4 w-64 max-w-full" />
      </div>
      <StatCardsSkeleton count={4} className="grid-cols-2 lg:grid-cols-4" />
      <Skeleton className="h-72 w-full rounded-xl" />
    </div>
  )
}