import Avatar from '@/components/avatar'
import RoleBadge from '@/components/role-badge'
import StatusBadge from '@/components/status-badge'
import type { UserDetail } from '../types/user-types'
import RowActions from './row-actions'

export default function UserDetailHeader({
  detail,
  isSelf,
}: {
  detail: UserDetail
  isSelf: boolean
}) {
  // El estado académico solo cuenta si la persona todavía tiene el rol
  const studentStatus = detail.roles.includes('student') ? detail.student?.status : null

  return (
    <header className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar name={detail.name} path={detail.avatarPath} size="lg" />

        <div className="min-w-0 space-y-2">
          <div>
            <h1 className="truncate text-2xl font-bold tracking-tight">{detail.name}</h1>
            <p className="muted truncate text-sm">{detail.email}</p>
          </div>

          <div className="flex flex-wrap gap-1.5">
            {detail.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
            {isSelf && <StatusBadge tone="emerald">Tu cuenta</StatusBadge>}
            {detail.disabled && <StatusBadge>Desactivado</StatusBadge>}
            {detail.mustChangePassword && <StatusBadge tone="amber">Contraseña temporal</StatusBadge>}
            {studentStatus === 'inactive' && <StatusBadge tone="amber">Estudiante inactivo</StatusBadge>}
            {studentStatus === 'graduated' && <StatusBadge tone="sky">Graduado</StatusBadge>}
          </div>
        </div>
      </div>

      <RowActions
        userId={detail.id}
        name={detail.name}
        disabled={detail.disabled}
        isSelf={isSelf}
        showDetail={false}
        redirectOnDelete
        triggerLabel="Acciones"
      />
    </header>
  )
}