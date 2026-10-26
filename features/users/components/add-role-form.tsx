'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelectField, TextField } from '@/components/form/fields'
import { ROLE_LABELS } from '@/lib/roles'
import { ROLES } from '@/lib/schemas'
import { addRoleSchema, type AddRoleValues } from '../schemas/users-shema'
import { addRole } from '../services/manage-roles'
import type { EditUserData } from '../types/user-types'

const CODE_HINT = (
  <p className="muted text-xs">
    El código de carnet se asigna automáticamente. Si la persona ya tuvo este rol,
    se conserva el anterior.
  </p>
)

export default function AddRoleForm({
  data,
  onAdded,
}: {
  data: EditUserData
  onAdded: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const available = ROLES.filter((r) => !data.roles.includes(r))

  if (available.length === 0) {
    return <p className="muted text-sm">Esta persona ya tiene todos los roles.</p>
  }

  // Los datos conservados de un rol anterior llegan pre-llenados
  const v = data.values
  const defaultValues: AddRoleValues = {
    user_id: v.user_id,
    role: available[0],
    student_admission_date: v.student_admission_date,
    teacher_specialty: v.teacher_specialty,
    teacher_academic_degree: v.teacher_academic_degree,
    teacher_hire_date: v.teacher_hire_date,
    staff_position: v.staff_position,
    staff_area: v.staff_area,
    staff_hire_date: v.staff_hire_date,
  }

  return (
    <AddRoleFormInner
      defaultValues={defaultValues}
      options={available.map((r) => ({ value: r, label: ROLE_LABELS[r] }))}
      error={error}
      setError={setError}
      onAdded={onAdded}
    />
  )
}

function AddRoleFormInner({
  defaultValues,
  options,
  error,
  setError,
  onAdded,
}: {
  defaultValues: AddRoleValues
  options: { value: string; label: string }[]
  error: string | null
  setError: (e: string | null) => void
  onAdded: (message: string) => void
}) {
  const form = useForm({
    defaultValues,
    validators: { onSubmit: addRoleSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = await addRole(value)
      if (res.error) setError(res.error)
      else onAdded(res.success ?? 'Rol agregado')
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

      <form.Field name="role">
        {(f) => <SelectField field={f} label="Rol a agregar" options={options} />}
      </form.Field>

      <form.Subscribe selector={(s) => s.values.role}>
        {(role) => (
          <>
            {role === 'student' && (
              <div className="space-y-4">
                {CODE_HINT}
                <form.Field name="student_admission_date">
                  {(f) => (
                    <TextField field={f} label="Fecha de ingreso (opcional)" type="date" />
                  )}
                </form.Field>
              </div>
            )}

            {role === 'teacher' && (
              <div className="space-y-4">
                {CODE_HINT}
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="teacher_specialty">
                    {(f) => <TextField field={f} label="Especialidad" />}
                  </form.Field>
                  <form.Field name="teacher_hire_date">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Fecha de contratación (opcional)"
                        type="date"
                      />
                    )}
                  </form.Field>
                  <form.Field name="teacher_academic_degree">
                    {(f) => <TextField field={f} label="Título académico (opcional)" />}
                  </form.Field>
                </div>
              </div>
            )}

            {role === 'staff' && (
              <div className="space-y-4">
                {CODE_HINT}
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="staff_position">
                    {(f) => <TextField field={f} label="Cargo" />}
                  </form.Field>
                  <form.Field name="staff_area">
                    {(f) => <TextField field={f} label="Área" />}
                  </form.Field>
                  <form.Field name="staff_hire_date">
                    {(f) => (
                      <TextField
                        field={f}
                        label="Fecha de contratación (opcional)"
                        type="date"
                      />
                    )}
                  </form.Field>
                </div>
              </div>
            )}

            {role === 'admin' && (
              <p className="muted text-sm">
                El rol de administrador no necesita datos adicionales.
              </p>
            )}
          </>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            {isSubmitting ? 'Agregando...' : 'Agregar rol'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}