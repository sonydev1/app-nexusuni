'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SelectField, TextAreaField, TextField } from '@/components/form/fields'
import { PROGRAM_LEVEL_OPTIONS } from '../constants'
import { programSchema, type ProgramValues } from '../schemas/program-schema'
import { createProgram, updateProgram } from '../services/program-actions'
import type { DepartmentOption, ProgramRow } from '../types/program-types'

export default function ProgramForm({
  program,
  departments,
  onSuccess,
}: {
  program?: ProgramRow
  departments: DepartmentOption[]
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const departmentOptions = [
    { value: '', label: 'Selecciona un departamento' },
    ...departments
      .filter((d) => d.isActive || d.id === program?.departmentId)
      .map((d) => ({
        value: d.id,
        label: `${d.code} · ${d.name}${d.isActive ? '' : ' (inactivo)'}`,
      })),
  ]

  const defaultValues: ProgramValues = {
    code: program?.code ?? '',
    name: program?.name ?? '',
    department_id: program?.departmentId ?? '',
    level: program?.level ?? 'undergraduate',
    duration_semesters: program ? String(program.durationSemesters) : '10',
    total_credits: program ? String(program.totalCredits) : '',
    description: program?.description ?? '',
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: programSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = program
        ? await updateProgram({ id: program.id, ...value })
        : await createProgram(value)

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
          {(f) => <TextField field={f} label="Código" placeholder="Ej: ISIS" />}
        </form.Field>
        <form.Field name="name">
          {(f) => <TextField field={f} label="Nombre" placeholder="Ej: Ingeniería de Sistemas" />}
        </form.Field>
      </div>

      <form.Field name="department_id">
        {(f) => <SelectField field={f} label="Departamento" options={departmentOptions} />}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-3">
        <form.Field name="level">
          {(f) => <SelectField field={f} label="Nivel" options={PROGRAM_LEVEL_OPTIONS} />}
        </form.Field>
        <form.Field name="duration_semesters">
          {(f) => <TextField field={f} label="Semestres" type="number" />}
        </form.Field>
        <form.Field name="total_credits">
          {(f) => <TextField field={f} label="Créditos" type="number" placeholder="Ej: 160" />}
        </form.Field>
      </div>
      <p className="muted -mt-2 text-xs">
        Los créditos son la meta de la carrera; se compararán con los cursos de su plan de estudios.
      </p>

      <form.Field name="description">
        {(f) => (
          <TextAreaField field={f} label="Descripción (opcional)" maxLength={500} />
        )}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : program ? 'Guardar cambios' : 'Crear carrera'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}