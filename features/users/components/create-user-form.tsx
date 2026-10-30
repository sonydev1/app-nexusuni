'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Section from '@/components/form/section'
import { SelectField, TextField } from '@/components/form/fields'
import { DOCUMENT_OPTIONS } from '@/lib/options'
import { createUserSchema, type CreateUserValues } from '../schemas/users-schema'
import { createUser } from '../services/create-user'

const defaultValues: CreateUserValues = {
  full_name: '',
  email: '',
  password: '',
  role: 'student',
  document_type: 'CC',
  document_number: '',
  phone: '',
  birth_date: '',
  admission_date: '',
  hire_date: '',
  specialty: '',
  academic_degree: '',
  position: '',
  area: '',
}

const ROLE_OPTIONS = [
  { value: 'student', label: 'Estudiante' },
  { value: 'teacher', label: 'Docente' },
  { value: 'staff', label: 'Administrativo' },
  { value: 'admin', label: 'Administrador' },
]

const CODE_HINT = (
  <p className="muted text-xs">El código de carnet se asigna automáticamente al guardar.</p>
)

export default function CreateUserForm({
  onSuccess,
}: {
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const form = useForm({
    defaultValues,
    validators: { onSubmit: createUserSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = await createUser(value)
      if (res.success) onSuccess(res.success)
      else setError(res.error ?? 'No se pudo crear el usuario')
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

      <Section title="Cuenta">
        <form.Field name="role">
          {(f) => <SelectField field={f} label="Rol" options={ROLE_OPTIONS} />}
        </form.Field>
        <form.Field name="full_name">
          {(f) => <TextField field={f} label="Nombre completo" />}
        </form.Field>
        <form.Field name="email">
          {(f) => <TextField field={f} label="Correo institucional" type="email" />}
        </form.Field>
        <form.Field name="password">
          {(f) => (
            <TextField
              field={f}
              label="Contraseña temporal"
              type="password"
              placeholder="Mínimo 8 caracteres"
            />
          )}
        </form.Field>
      </Section>

      <Section title="Datos personales">
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

      <form.Subscribe selector={(s) => s.values.role}>
        {(role) => (
          <>
            {role === 'student' && (
              <Section title="Datos del estudiante">
                {CODE_HINT}
                <form.Field name="admission_date">
                  {(f) => <TextField field={f} label="Fecha de ingreso (opcional)" type="date" />}
                </form.Field>
              </Section>
            )}

            {role === 'teacher' && (
              <Section title="Datos del docente">
                {CODE_HINT}
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="specialty">
                    {(f) => <TextField field={f} label="Especialidad" placeholder="Ej: Matemáticas" />}
                  </form.Field>
                  <form.Field name="hire_date">
                    {(f) => (
                      <TextField field={f} label="Fecha de contratación (opcional)" type="date" />
                    )}
                  </form.Field>
                  <form.Field name="academic_degree">
                    {(f) => (
                      <TextField field={f} label="Título académico (opcional)" placeholder="Ej: Magíster" />
                    )}
                  </form.Field>
                </div>
              </Section>
            )}

            {role === 'staff' && (
              <Section title="Datos del administrativo">
                {CODE_HINT}
                <div className="grid gap-4 sm:grid-cols-2">
                  <form.Field name="position">
                    {(f) => <TextField field={f} label="Cargo" placeholder="Ej: Secretaria académica" />}
                  </form.Field>
                  <form.Field name="area">
                    {(f) => <TextField field={f} label="Área" placeholder="Ej: Admisiones" />}
                  </form.Field>
                  <form.Field name="hire_date">
                    {(f) => (
                      <TextField field={f} label="Fecha de contratación (opcional)" type="date" />
                    )}
                  </form.Field>
                </div>
              </Section>
            )}
          </>
        )}
      </form.Subscribe>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Creando...' : 'Crear usuario'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}