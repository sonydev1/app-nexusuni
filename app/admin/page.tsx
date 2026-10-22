import { Suspense } from 'react'
import Link from 'next/link'
import { connection } from 'next/server'
import { ArrowRight, GraduationCap, UserCheck, UserPlus, Users } from 'lucide-react'
import { createAdminClient } from '@/utils/supabase/admin'
import StatCard from '@/components/stat-card';
import Avatar from '@/components/avatar'
import RoleBadge from '@/components/role-badge'
import { ROLE_LABELS } from '@/lib/roles'

const ROLE_KEYS = ['student', 'teacher', 'staff', 'admin'] as const

// Clases completas para que Tailwind las detecte
const BAR_COLORS: Record<string, string> = {
  student: 'bg-sky-500',
  teacher: 'bg-emerald-500',
  staff: 'bg-amber-500',
  admin: 'bg-indigo-500',
}

async function DashboardData() {
  await connection()
  const admin = createAdminClient()

  const now = new Date()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const head = { count: 'exact', head: true } as const

  const [total, thisMonth, activeStudents, recent, ...roleCounts] = await Promise.all([
    admin.from('profiles').select('*', head),
    admin.from('profiles').select('*', head).gte('created_at', monthStart),
    admin.from('students').select('*', head).eq('status', 'active'),
    admin
      .from('profiles')
      .select('id, full_name, avatar_path, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    ...ROLE_KEYS.map((r) => admin.from('user_roles').select('*', head).eq('role', r)),
  ])

  // Roles de los usuarios recientes
  const ids = (recent.data ?? []).map((p) => p.id)
  const { data: recentRoles } = ids.length
    ? await admin.from('user_roles').select('user_id, role').in('user_id', ids)
    : { data: [] }

  const rolesByUser = new Map<string, string[]>()
  recentRoles?.forEach((r) => {
    rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role])
  })

  const counts = ROLE_KEYS.map((role, i) => ({ role, count: roleCounts[i].count ?? 0 }))
  const maxCount = Math.max(1, ...counts.map((c) => c.count))

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <StatCard label="Usuarios totales" value={total.count ?? 0} icon={Users} />
        <StatCard label="Nuevos este mes" value={thisMonth.count ?? 0} icon={UserPlus} />
        <StatCard label="Estudiantes activos" value={activeStudents.count ?? 0} icon={GraduationCap} />
        <StatCard
          label="Docentes"
          value={counts.find((c) => c.role === 'teacher')?.count ?? 0}
          icon={UserCheck}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Distribución por rol */}
        <section className="card p-4 sm:p-6 lg:col-span-2">
          <h2 className="font-semibold">Usuarios por rol</h2>
          <p className="muted text-xs">Una persona con varios roles cuenta en cada uno.</p>

          <ul className="mt-5 space-y-4">
            {counts.map(({ role, count }) => (
              <li key={role} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span>{ROLE_LABELS[role]}</span>
                  <span className="font-medium">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${BAR_COLORS[role]}`}
                    style={{ width: `${(count / maxCount) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>

        {/* Últimos usuarios */}
        <section className="card overflow-hidden lg:col-span-3">
          <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
            <h2 className="font-semibold">Últimos usuarios</h2>
            <Link
              href="/admin/users"
              className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <ul className="divide-y divide-slate-100 dark:divide-slate-800">
            {(recent.data ?? []).map((p) => (
              <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar name={p.full_name ?? '?'} path={p.avatar_path} />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{p.full_name ?? 'Sin nombre'}</p>
                    <p className="muted text-xs">
                      {new Date(p.created_at).toLocaleDateString('es-CO', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap justify-end gap-1">
                  {(rolesByUser.get(p.id) ?? []).map((r) => (
                    <RoleBadge key={r} role={r} />
                  ))}
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-72 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}

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