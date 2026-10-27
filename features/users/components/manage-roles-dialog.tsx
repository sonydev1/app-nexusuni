'use client'

import { useEffect, useState, useTransition } from 'react'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import RoleBadge from '@/components/role-badge'
import { getUserForEdit } from '../services/edit-user'
import { removeRole } from '../services/manage-roles'
import type { EditUserData } from '../types/user-types'
import AddRoleForm from './add-role-form'
import { FormSkeleton } from '@/components/skeleton';

type LoadState = { data: EditUserData } | { error: string } | null

function RolesManager({ userId, isSelf }: { userId: string; isSelf: boolean }) {
  const [state, setState] = useState<LoadState>(null)
  const [version, setVersion] = useState(0)
  const [pending, startTransition] = useTransition()

  // Se vuelve a cargar al abrir y después de cada cambio
  useEffect(() => {
    let cancelled = false
    getUserForEdit(userId).then((res) => {
      if (!cancelled) setState(res)
    })
    return () => {
      cancelled = true
    }
  }, [userId, version])

  if (!state) {
    return( <FormSkeleton
      label="Cargando roles…"
      sections={[
        { kind: 'list', title: true, rows: 2, note: true },
        { title: true, fields: 1, columns: 1 },
      ]}
    />)
  }
  if ('error' in state) {
    return <div className="alert-error">{state.error}</div>
  }

  const { data } = state

  function onRemove(role: string) {
    startTransition(async () => {
      const res = await removeRole(userId, role)
      if (res.error) toast.error(res.error)
      else {
        toast.success(res.success)
        setVersion((v) => v + 1)
      }
    })
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Roles actuales
        </h3>

        <ul className="space-y-2">
          {data.roles.map((role) => {
            const blocked =
              data.roles.length === 1 || (isSelf && role === 'admin')
            return (
              <li
                key={role}
                className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 dark:border-slate-700"
              >
                <RoleBadge role={role} />
                <button
                  type="button"
                  disabled={pending || blocked}
                  onClick={() => onRemove(role)}
                  title={
                    data.roles.length === 1
                      ? 'No se puede quitar el único rol'
                      : isSelf && role === 'admin'
                        ? 'No puedes quitarte tu propio rol de administrador'
                        : 'Quitar rol'
                  }
                  className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-500/10"
                >
                  {pending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <X className="h-4 w-4" />
                  )}
                  Quitar
                </button>
              </li>
            )
          })}
        </ul>

        <p className="muted text-xs">
          Al quitar un rol, sus datos (código, cargo, etc.) se conservan por si la persona
          vuelve a tenerlo.
        </p>
      </section>

      <section className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Agregar rol
        </h3>
        {/* key: reinicia el formulario después de cada cambio */}
        <AddRoleForm
          key={version}
          data={data}
          onAdded={(message) => {
            toast.success(message)
            setVersion((v) => v + 1)
          }}
        />
      </section>
    </div>
  )
}

export default function ManageRolesDialog({
  userId,
  name,
  isSelf,
  open,
  onOpenChange,
}: {
  userId: string
  name: string
  isSelf: boolean
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Gestionar roles</DialogTitle>
          <DialogDescription>{name}</DialogDescription>
        </DialogHeader>

        <RolesManager userId={userId} isSelf={isSelf} />
      </DialogContent>
    </Dialog>
  )
}