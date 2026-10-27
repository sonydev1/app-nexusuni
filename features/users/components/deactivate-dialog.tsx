'use client'

import { useState, useTransition } from 'react'
import { Loader2 } from 'lucide-react'
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
import { deactivateUser } from '../services/manage-user'

function DeactivateForm({ userId, onDone }: { userId: string; onDone: () => void }) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  function submit() {
    setError(null)
    startTransition(async () => {
      const res = await deactivateUser(userId, reason)
      if (res.error) setError(res.error)
      else {
        toast.success(res.success)
        onDone()
      }
    })
  }

  return (
    <>
      <div className="space-y-1.5">
        <label htmlFor="reason" className="text-sm font-medium">
          Motivo
        </label>
        <textarea
          id="reason"
          rows={3}
          maxLength={200}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Ej: Retiro de la universidad"
          className="input"
        />
        <p className="muted text-right text-xs">{reason.length}/200</p>
        {error && <p className="text-xs text-red-600 dark:text-red-400">{error}</p>}
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          Desactivar cuenta
        </Button>
      </DialogFooter>
    </>
  )
}

export default function DeactivateDialog({
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
          <DialogTitle>Desactivar a {name}</DialogTitle>
          <DialogDescription>
            No podrá iniciar sesión y perderá el acceso de inmediato. Sus datos se conservan y
            puedes reactivarla cuando quieras.
          </DialogDescription>
        </DialogHeader>

        {/* Se desmonta al cerrar: el motivo siempre empieza vacío */}
        <DeactivateForm userId={userId} onDone={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  )
}