import {
  BarsPanelSkeleton,
  ListPanelSkeleton,
  StatCardsSkeleton,
} from '@/components/page-skeletons'

export default function DashboardSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Cargando dashboard…</span>

      <StatCardsSkeleton count={4} className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-4" />

      <div className="grid gap-6 lg:grid-cols-5">
        <BarsPanelSkeleton rows={4} className="lg:col-span-2" />
        <ListPanelSkeleton rows={6} className="lg:col-span-3" />
      </div>
    </div>
  )
}