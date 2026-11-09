'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextAreaField, TextField } from '@/components/form/fields'
import { departmentSchema } from '../schemas/department-schema'
import { createDepartment, updateDepartment } from '../services/department-actions'
import type { DepartmentRow } from '../types/department-types'

export default function DepartmentForm({
  department,
  onSuccess,
}: {
  department?: DepartmentRow
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: {
      code: department?.code ?? '',
      name: department?.name ?? '',
      description: department?.description ?? '',
    },
    validators: { onSubmit: departmentSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = department
        ? await updateDepartment({ id: department.id, ...value })
        : await createDepartment(value)

      if (res.error) setError(res.error)
      else onSuccess(res.success ?? 'Guardado')
    },
  })

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }}
      className="space-y-4"
    >
      {error && (
        <div className="alert-error">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
        <form.Field name="code">
          {(f) => <TextField field={f} label="Código" placeholder="Ej: ING" />}
        </form.Field>
        <form.Field name="name">
          {(f) => <TextField field={f} label="Nombre" placeholder="Ej: Ingeniería" />}
        </form.Field>
      </div>
      <p className="muted -mt-2 text-xs">
        El código se guarda en mayúsculas. Solo letras, números y guiones (2 a 10 caracteres).
      </p>

      <form.Field name="description">
        {(f) => (
          <TextAreaField
            field={f}
            label="Descripción (opcional)"
            maxLength={500}
            placeholder="Qué áreas agrupa este departamento"
          />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : department ? 'Guardar cambios' : 'Crear departamento'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}