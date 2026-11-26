'use client'

import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { TermRow } from '../types/term-types'
import TermForm from './term-form'

export default function TermDialog({
  open,
  onOpenChange,
  term,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  term?: TermRow
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{term ? `Editar ${term.code}` : 'Nuevo periodo'}</DialogTitle>
          <DialogDescription>
            Los periodos no pueden cruzarse. El estado se calcula con las fechas.
          </DialogDescription>
        </DialogHeader>

        {/* Se desmonta al cerrar: el formulario siempre arranca con los datos actuales */}
        <TermForm
          term={term}
          onSuccess={(message) => {
            onOpenChange(false)
            toast.success(message)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}