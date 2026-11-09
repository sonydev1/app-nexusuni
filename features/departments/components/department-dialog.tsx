'use client'

import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { DepartmentRow } from '../types/department-types'
import DepartmentForm from './department-form'

export default function DepartmentDialog({
  open,
  onOpenChange,
  department,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  department?: DepartmentRow
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{department ? 'Editar departamento' : 'Nuevo departamento'}</DialogTitle>
          <DialogDescription>
            {department
              ? department.name
              : 'Las carreras y los cursos se asignarán a un departamento.'}
          </DialogDescription>
        </DialogHeader>

        <DepartmentForm
          department={department}
          onSuccess={(message) => {
            onOpenChange(false)
            toast.success(message)
          }}
        />
      </DialogContent>
    </Dialog>
  )
}