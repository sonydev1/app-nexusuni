import { cn } from '@/lib/utils'

export type InfoItem = [label: string, value: React.ReactNode]

export default function InfoCard({
  title,
  badge,
  items,
  className,
}: {
  title: string
  badge?: React.ReactNode
  items: InfoItem[]
  className?: string
}) {
  return (
    <section className={cn('card p-4 sm:p-6', className)}>
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-semibold">{title}</h2>
        {badge}
      </div>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label} className="min-w-0">
            <dt className="muted text-xs uppercase tracking-wide">{label}</dt>
            <dd className="mt-0.5 break-words text-sm font-medium">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}