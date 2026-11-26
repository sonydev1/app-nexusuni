'use client'

import { useState, useTransition } from 'react'
import { CalendarCheck, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteTerm, setCurrentTerm } from '../services/term-actions'
import type { TermRow } from '../types/term-types'
import TermDialog from './term-dialog'

export default function TermRowActions({ term }: { term: TermRow }) {
  const [editOpen, setEditOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pending, startTransition] = useTransition()

  function makeCurrent() {
    startTransition(async () => {
      const res = await setCurrentTerm(term.id)
      if (res.error) toast.error(res.error)
      else toast.success(res.success)
    })
  }

  function confirmDelete() {
    startTransition(async () => {
      const res = await deleteTerm(term.id)
      if (res.error) toast.error(res.error)
      else toast.success(res.success)
      setConfirmOpen(false)
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Acciones para ${term.code}`}
            disabled={pending}
          >
            {pending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <MoreHorizontal className="h-4 w-4" />
            )}
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>{term.code}</DropdownMenuLabel>
          <DropdownMenuSeparator />

          <DropdownMenuItem onSelect={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem disabled={term.isCurrent} onSelect={makeCurrent}>
            <CalendarCheck className="mr-2 h-4 w-4" />
            Marcar como vigente
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onSelect={() => setConfirmOpen(true)}
            className="text-red-600 focus:text-red-600 dark:text-red-400"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <TermDialog term={term} open={editOpen} onOpenChange={setEditOpen} />

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {term.isCurrent ? 'No se puede eliminar' : `¿Eliminar el periodo ${term.code}?`}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {term.isCurrent
                ? 'Es el periodo vigente. Marca otro como vigente antes de eliminarlo.'
                : 'Esta acción no se puede deshacer. Si ya tiene secciones o matrículas no se podrá eliminar.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>
              {term.isCurrent ? 'Cerrar' : 'Cancelar'}
            </AlertDialogCancel>
            {!term.isCurrent && (
              <AlertDialogAction
                disabled={pending}
                onClick={(e) => {
                  e.preventDefault()
                  confirmDelete()
                }}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Eliminar
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}