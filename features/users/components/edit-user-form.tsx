'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Section from '@/components/form/section'
import { SelectField, TextField } from '@/components/form/fields'
import { DOCUMENT_OPTIONS, STUDENT_STATUS_OPTIONS } from '@/lib/options'
import { makeUpdateUserSchema } from '../schemas/users-shema'
import { updateUser } from '../services/edit-user'
import type { EditUserData } from '../types/user-types'

export default function EditUserForm({
  data,
  onSuccess,
}: {
  data: EditUserData
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues: data.values,
    validators: { onSubmit: makeUpdateUserSchema(data.roles) },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = await updateUser(value)
      if (res.error) setError(res.error)
      else onSuccess(res.success ?? 'Cambios guardados')
    },
  })

  const has = (role: string) => data.roles.includes(role)

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

      <Section title="Datos personales">
        <form.Field name="full_name">
          {(f) => <TextField field={f} label="Nombre completo" />}
        </form.Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="document_type">
            {(f) => <SelectField field={f} label="Tipo de documento" options={DOCUMENT_OPTIONS} />}
          </form.Field>
          <form.Field name="document_number">
            {(f) => <TextField field={f} label="Número de documento" />}
          </form.Field>
          <form.Field name="phone">
            {(f) => <TextField field={f} label="Teléfono (opcional)" type="tel" />}
          </form.Field>
          <form.Field name="birth_date">
            {(f) => <TextField field={f} label="Fecha de nacimiento (opcional)" type="date" />}
          </form.Field>
        </div>
      </Section>

      {has('student') && (
        <Section title="Datos del estudiante">
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="student_code">
              {(f) => <TextField field={f} label="Código estudiantil" disabled placeholder="Se genera al guardar" />}
            </form.Field>
            <form.Field name="student_status">
              {(f) => <SelectField field={f} label="Estado" options={STUDENT_STATUS_OPTIONS} />}
            </form.Field>
            <form.Field name="student_admission_date">
              {(f) => <TextField field={f} label="Fecha de ingreso (opcional)" type="date" />}
            </form.Field>
          </div>
        </Section>
      )}

      {has('teacher') && (
        <Section title="Datos del docente">
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="teacher_employee_code">
              {(f) => <TextField field={f} label="Código de empleado" disabled placeholder="Se genera al guardar"/>}
            </form.Field>
            <form.Field name="teacher_hire_date">
              {(f) => <TextField field={f} label="Fecha de contratación (opcional)" type="date" />}
            </form.Field>
            <form.Field name="teacher_specialty">
              {(f) => <TextField field={f} label="Especialidad" />}
            </form.Field>
            <form.Field name="teacher_academic_degree">
              {(f) => <TextField field={f} label="Título académico (opcional)" />}
            </form.Field>
          </div>
        </Section>
      )}

      {has('staff') && (
        <Section title="Datos del administrativo">
          <div className="grid gap-4 sm:grid-cols-2">
            <form.Field name="staff_employee_code">
              {(f) => <TextField field={f} label="Código de empleado" disabled placeholder="Se genera al guardar"/>}
            </form.Field>
            <form.Field name="staff_hire_date">
              {(f) => <TextField field={f} label="Fecha de contratación (opcional)" type="date" />}
            </form.Field>
            <form.Field name="staff_position">
              {(f) => <TextField field={f} label="Cargo" />}
            </form.Field>
            <form.Field name="staff_area">
              {(f) => <TextField field={f} label="Área" />}
            </form.Field>
          </div>
        </Section>
      )}

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}