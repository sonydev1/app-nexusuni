import { GraduationCap, UserCheck, UserPlus, Users } from 'lucide-react'
import StatCard from '@/components/stat-card'
import type { DashboardData } from '../types/dashboard-types'

export default function StatsGrid({ totals }: { totals: DashboardData['totals'] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
      <StatCard label="Usuarios totales" value={totals.users} icon={Users} />
      <StatCard label="Nuevos este mes" value={totals.newThisMonth} icon={UserPlus} />
      <StatCard label="Estudiantes activos" value={totals.activeStudents} icon={GraduationCap} />
      <StatCard label="Docentes" value={totals.teachers} icon={UserCheck} />
    </div>
  )
}