'use client'

import { useState, useTransition } from 'react'
import { Copy, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { resetUserPassword } from '../services/reset-password'

function ResetBody({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [password, setPassword] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function generate() {
    setError(null)
    startTransition(async () => {
      const res = await resetUserPassword(userId)
      if (res.error) setError(res.error)
      else setPassword(res.tempPassword ?? null)
    })
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(password ?? '')
      toast.success('Contraseña copiada')
    } catch {
      toast.error('No se pudo copiar. Selecciónala y cópiala a mano.')
    }
  }

  if (password) {
    return (
      <>
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3 dark:border-slate-600 dark:bg-slate-900">
            <code className="select-all break-all font-mono text-lg tracking-wide">{password}</code>
            <Button type="button" variant="outline" size="sm" onClick={copy}>
              <Copy className="h-4 w-4" />
              Copiar
            </Button>
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300">
            Se muestra una sola vez. Entrégala a la persona por un canal seguro; deberá cambiarla
            al iniciar sesión.
          </p>
        </div>
        <DialogFooter>
          <Button onClick={onDone}>Listo</Button>
        </DialogFooter>
      </>
    )
  }

  return (
    <>
      {error && <div className="alert-error">{error}</div>}
      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button onClick={generate} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Generar contraseña
        </Button>
      </DialogFooter>
    </>
  )
}

export default function ResetPasswordDialog({
  userId,
  name,
  open,
  onOpenChange,
}: {
  userId: string
  name: string
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Restablecer contraseña de {name}</DialogTitle>
          <DialogDescription>
            Se genera una contraseña temporal y la actual deja de funcionar. La persona tendrá que
            crear una nueva al iniciar sesión.
          </DialogDescription>
        </DialogHeader>

        {/* Se desmonta al cerrar: la contraseña nunca queda en memoria */}
        <ResetBody userId={userId} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}