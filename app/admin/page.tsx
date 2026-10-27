import { Suspense } from 'react'
import DashboardData from '@/features/dashboard/components/dashboard-data'
import DashboardSkeleton from '@/features/dashboard/components/dashboard-skeleton'

export default function AdminDashboardPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="muted text-sm">Resumen general del sistema.</p>
      </div>

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardData />
      </Suspense>
    </main>
  )
}