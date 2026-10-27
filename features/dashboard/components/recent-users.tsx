import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Avatar from '@/components/avatar'
import RoleBadge from '@/components/role-badge'
import type { RecentUser } from '../types/dashboard-types'

export default function RecentUsers({
  users,
  className,
}: {
  users: RecentUser[]
  className?: string
}) {
  return (
    <section className={`card overflow-hidden ${className ?? ''}`}>
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-4 dark:border-slate-800 sm:px-6">
        <h2 className="font-semibold">Últimos usuarios</h2>
        <Link
          href="/admin/users"
          className="inline-flex items-center gap-1 text-sm font-medium text-indigo-600 hover:underline dark:text-indigo-400"
        >
          Ver todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {users.length === 0 ? (
        <p className="muted px-6 py-10 text-center text-sm">Todavía no hay usuarios.</p>
      ) : (
        <ul className="divide-y divide-slate-100 dark:divide-slate-800">
          {users.map((u) => (
            <li key={u.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-6">
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={u.name} path={u.avatarPath} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{u.name}</p>
                  <p className="muted text-xs">{u.dateLabel}</p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-1">
                {u.roles.map((r) => (
                  <RoleBadge key={r} role={r} />
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}