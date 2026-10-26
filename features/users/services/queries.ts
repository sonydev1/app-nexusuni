import 'server-only'
import type { User } from '@supabase/supabase-js'
import { createAdminClient } from '@/utils/supabase/admin'
import type { UserRow } from '../types/user-types'

async function fetchAllAuthUsers(admin: ReturnType<typeof createAdminClient>) {
  const perPage = 200
  const all: User[] = []

  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
    if (error) throw error
    all.push(...data.users)
    if (data.users.length < perPage) break
  }
  return all
}

export async function getUsersData() {
  const admin = createAdminClient()

  const [authUsers, { data: roles }, { data: profiles },{data: students}] = await Promise.all([
    fetchAllAuthUsers(admin),
    admin.from('user_roles').select('user_id, role'),
    admin
      .from('profiles')
      .select('id, full_name, avatar_path, document_type, document_number, created_at'),
      admin.from('students').select('user_id, status'),
  ])

  const statusByUser = new Map(students?.map((s) => [s.user_id, s.status]))
  
  
  const rolesByUser = new Map<string, string[]>()
  roles?.forEach((r) => {
    rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role])
  })
  const profileById = new Map(profiles?.map((p) => [p.id, p]))
  const now = Date.now()
  
  const rows: UserRow[] = authUsers.map((u) => {
    const userRoles = rolesByUser.get(u.id) ?? []
    const p = profileById.get(u.id)
    const createdAt = p?.created_at ?? new Date(0).toISOString()
    return {
      id: u.id,
      name: p?.full_name ?? 'Sin nombre',
      email: u.email ?? '',
      avatarPath: p?.avatar_path ?? null,
      document: p?.document_number ? `${p.document_type} ${p.document_number}` : '',
      roles: userRoles,
      createdAt,
      createdLabel: new Date(createdAt).toLocaleDateString('es-CO', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        timeZone: 'America/Bogota',
      }),
     studentStatus: userRoles.includes('student')
  ? ((statusByUser.get(u.id) as UserRow['studentStatus']) ?? null)
  : null,
      disabled: !!u.banned_until && new Date(u.banned_until).getTime() > now,
    }
  })

  const counts: Record<string, number> = { student: 0, teacher: 0, staff: 0, admin: 0 }
  roles?.forEach((r) => {
    counts[r.role] = (counts[r.role] ?? 0) + 1
  })

  return { rows, counts }
}