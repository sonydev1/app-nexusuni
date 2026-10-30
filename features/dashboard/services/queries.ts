import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'
import { ROLES } from '@/lib/schemas'
import type { DashboardData } from '../types/dashboard-types'
import { requireAdmin } from '@/lib/auth/require-admin';

const head = { count: 'exact', head: true } as const

// Primer instante del mes en hora de Colombia (UTC-5, sin horario de verano)
function bogotaMonthStart() {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
  }).formatToParts(new Date())
  const year = parts.find((p) => p.type === 'year')!.value
  const month = parts.find((p) => p.type === 'month')!.value
  return `${year}-${month}-01T00:00:00-05:00`
}

export async function getDashboardData(): Promise<DashboardData> {
  if (!(await requireAdmin())) throw new Error('No autorizado')
  const admin = createAdminClient()

  // Solo cuenta como "activo" quien todavía tiene el rol de estudiante:
  // al quitar un rol sus datos se conservan, y no deben inflar el conteo.
 async function countActiveStudents() {
  const { data } = await admin.rpc('count_active_students')
  return Number(data ?? 0)
}
  const [total, thisMonth, activeStudents, recent, ...roleResults] = await Promise.all([
    admin.from('profiles').select('*', head),
    admin.from('profiles').select('*', head).gte('created_at', bogotaMonthStart()),
    countActiveStudents(),
    admin
      .from('profiles')
      .select('id, full_name, avatar_path, created_at')
      .order('created_at', { ascending: false })
      .limit(6),
    ...ROLES.map((r) => admin.from('user_roles').select('*', head).eq('role', r)),
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

  const roleCounts = ROLES.map((role, i) => ({
    role: role as string,
    count: roleResults[i].count ?? 0,
  }))

  return {
    totals: {
      users: total.count ?? 0,
      newThisMonth: thisMonth.count ?? 0,
      activeStudents,
      teachers: roleCounts.find((c) => c.role === 'teacher')?.count ?? 0,
    },
    roleCounts,
    recent: (recent.data ?? []).map((p) => ({
      id: p.id,
      name: p.full_name ?? 'Sin nombre',
      avatarPath: p.avatar_path,
      dateLabel: new Date(p.created_at).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Bogota',
      }),
      roles: rolesByUser.get(p.id) ?? [],
    })),
  }
}