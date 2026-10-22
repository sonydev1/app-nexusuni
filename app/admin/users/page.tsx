import { Suspense } from 'react'
import { connection } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'
import RoleBadge from '@/components/role-badge'
import { ROLE_LABELS } from '@/lib/roles'
import NewUserButton from './new-user-button'

async function UsersData() {
  await connection()

  const admin = createAdminClient()
  const { data: { users } } = await admin.auth.admin.listUsers()
  const { data: roles } = await admin.from('user_roles').select('user_id, role')
  const { data: profiles } = await admin.from('profiles').select('id, full_name')

  const rolesByUser = new Map<string, string[]>()
  roles?.forEach((r) => {
    rolesByUser.set(r.user_id, [...(rolesByUser.get(r.user_id) ?? []), r.role])
  })
  const nameById = new Map(profiles?.map((p) => [p.id, p.full_name]))

  const counts: Record<string, number> = { student: 0, teacher: 0, staff: 0, admin: 0 }
  roles?.forEach((r) => { counts[r.role] = (counts[r.role] ?? 0) + 1 })

  return (
    <>
      <div className="grid items-start gap-6 xl:grid-cols-[480px_1fr]">
        {Object.keys(ROLE_LABELS).map((role) => (
          <div key={role} className="card p-4">
            <p className="muted text-sm">{ROLE_LABELS[role]}s</p>
            <p className="mt-1 text-2xl font-bold">{counts[role] ?? 0}</p>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
          <h2 className="font-semibold">Todos los usuarios ({users.length})</h2>
        </div>

        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => {
            const name = nameById.get(u.id) ?? 'Sin nombre'
            return (
              <li
                key={u.id}
                className="flex flex-col gap-2 px-4 py-3 transition hover:bg-slate-50 dark:hover:bg-slate-800/50 sm:flex-row sm:items-center sm:justify-between sm:px-6"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="avatar">{name.charAt(0)}</div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{name}</p>
                    <p className="muted truncate text-sm">{u.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5 pl-12 sm:pl-0">
                  {(rolesByUser.get(u.id) ?? []).map((r) => (
                    <RoleBadge key={r} role={r} />
                  ))}
                </div>
              </li>
            )
          })}
        </ul>
      </div>
    </>
  )
}

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
    </div>
  )
}

export default function UsersPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="muted text-sm">
            Crea cuentas y consulta los roles de cada persona.
          </p>
        </div>
        <NewUserButton />
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersData />
      </Suspense>
    </main>
  )
}