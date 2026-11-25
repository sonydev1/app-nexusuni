import { Suspense } from 'react'
import NewUserButton from '@/features/users/components/new-user-button'
import UsersData from '@/features/users/components/users-data'
import UsersSkeleton from '@/features/users/components/users-skeleton'
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import NewUserAction from '@/features/users/components/new-user-action';

export default function UsersPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuarios</h1>
          <p className="muted text-sm">Crea cuentas y consulta los roles de cada persona.</p>
        </div>
        <Suspense
  fallback={
    <Button disabled>
      <UserPlus className="h-4 w-4" />
      <span className="hidden sm:inline">Nuevo usuario</span>
      <span className="sm:hidden">Nuevo</span>
    </Button>
  }
>
  <NewUserAction />
</Suspense>
      </div>

      <Suspense fallback={<UsersSkeleton />}>
        <UsersData />
      </Suspense>
    </main>
  )
}