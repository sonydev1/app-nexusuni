import { Suspense } from 'react'
import NewUserButton from '@/features/users/components/new-user-button'
import UsersData from '@/features/users/components/users-data'
import UsersSkeleton from '@/features/users/components/users-skeleton'

export default function UsersPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="muted text-sm">Crea cuentas y consulta los roles de cada persona.</p>
        </div>
        <NewUserButton />
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersData />
      </Suspense>
    </main>
  )
}