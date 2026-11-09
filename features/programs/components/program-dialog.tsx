'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DepartmentOption, ProgramRow } from '../types/program-types'
import ProgramForm from './program-form'

export default function ProgramDialog({
  open,
  onOpenChange,
  program,
  departments,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  program?: ProgramRow
  departments: DepartmentOption[]
}) {
  const hasActiveDepartment = departments.some((d) => d.isActive)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{program ? 'Editar carrera' : 'Nueva carrera'}</DialogTitle>
          <DialogDescription>
            {program ? program.name : 'Cada carrera pertenece a un departamento.'}
          </DialogDescription>
        </DialogHeader>

        {!program && !hasActiveDepartment ? (
          <div className="space-y-3 text-sm">
            <p>Primero necesitas al menos un departamento activo.</p>
            <Button asChild>
              <Link href="/admin/departments">Ir a departamentos</Link>
            </Button>
          </div>
        ) : (
          <ProgramForm
            program={program}
            departments={departments}
            onSuccess={(message) => {
              onOpenChange(false)
              toast.success(message)
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}