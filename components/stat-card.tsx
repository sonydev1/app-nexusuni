import type { LucideIcon } from 'lucide-react'

export default function StatCard({
  label,
  value,
  icon: Icon,
  hint,
}: {
  label: string
  value: number | string
  icon: LucideIcon
  hint?: string
}) {
  return (
    <div className="card flex items-start justify-between p-4 sm:p-5">
      <div className="min-w-0">
        <p className="muted text-sm">{label}</p>
        <p className="mt-1 text-3xl font-bold tracking-tight">{value}</p>
        {hint && <p className="muted mt-1 text-xs">{hint}</p>}
      </div>
      <div className="rounded-lg bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300">
        <Icon className="h-5 w-5" />
      </div>
    </div>
  )
}