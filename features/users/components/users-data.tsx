import { connection } from 'next/server'
import { getSessionAndRoles } from '@/utils/supabase/roles'
import { ROLE_LABELS } from '@/lib/roles'
import { getUsersData } from '../services/queries'
import UsersTable from './users-table'

export default async function UsersData() {
  await connection()

  const [{ user: currentUser }, { rows, counts }] = await Promise.all([
    getSessionAndRoles(),
    getUsersData(),
  ])

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {Object.keys(ROLE_LABELS).map((role) => (
          <div key={role} className="card p-4">
            <p className="muted text-sm">{ROLE_LABELS[role]}s</p>
            <p className="mt-1 text-2xl font-bold">{counts[role] ?? 0}</p>
          </div>
        ))}
      </div>

      <UsersTable data={rows} currentUserId={currentUser?.id ?? ''} />
    </>
  )
}