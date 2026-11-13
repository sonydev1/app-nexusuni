'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import FieldShell from '@/components/form/field-shell'
import { SelectField, TextAreaField, TextField } from '@/components/form/fields'
import type { DepartmentOption } from '@/features/programs/types/program-types'
import { courseSchema, type CourseValues } from '../schemas/course-schema'
import { createCourse, updateCourse } from '../services/course-actions'
import type { CourseOption, CourseRow } from '../types/course-types'
import PrerequisitePicker from './prerequisite-picker'

export default function CourseForm({
  course,
  departments,
  courseOptions,
  onSuccess,
}: {
  course?: CourseRow
  departments: DepartmentOption[]
  courseOptions: CourseOption[]
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  // Los departamentos inactivos no se ofrecen, salvo el actual del curso
  const departmentOptions = [
    { value: '', label: 'Selecciona un departamento' },
    ...departments
      .filter((d) => d.isActive || d.id === course?.departmentId)
      .map((d) => ({
        value: d.id,
        label: `${d.code} · ${d.name}${d.isActive ? '' : ' (inactivo)'}`,
      })),
  ]

  const defaultValues: CourseValues = {
    code: course?.code ?? '',
    name: course?.name ?? '',
    department_id: course?.departmentId ?? '',
    credits: course ? String(course.credits) : '',
    weekly_hours: course ? String(course.weeklyHours) : '',
    description: course?.description ?? '',
    prerequisite_ids: course?.prerequisites.map((p) => p.id) ?? [],
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: courseSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = course
        ? await updateCourse({ id: course.id, ...value })
        : await createCourse(value)

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
          {(f) => <TextField field={f} label="Código" placeholder="Ej: MAT101" />}
        </form.Field>
        <form.Field name="name">
          {(f) => <TextField field={f} label="Nombre" placeholder="Ej: Cálculo I" />}
        </form.Field>
      </div>

      <form.Field name="department_id">
        {(f) => <SelectField field={f} label="Departamento" options={departmentOptions} />}
      </form.Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <form.Field name="credits">
          {(f) => <TextField field={f} label="Créditos" type="number" placeholder="Ej: 3" />}
        </form.Field>
        <form.Field name="weekly_hours">
          {(f) => (
            <TextField field={f} label="Horas semanales" type="number" placeholder="Ej: 4" />
          )}
        </form.Field>
      </div>

      <form.Field name="prerequisite_ids">
        {(f) => (
          <FieldShell field={f} label="Prerrequisitos (opcional)">
            <PrerequisitePicker
              value={f.state.value as string[]}
              onChange={(ids) => f.handleChange(ids)}
              options={courseOptions}
              excludeId={course?.id}
            />
          </FieldShell>
        )}
      </form.Field>
      <p className="muted -mt-2 text-xs">
        Cursos que se deben aprobar antes. Solo se ofrecen los activos, y no se permiten ciclos.
      </p>

      <form.Field name="description">
        {(f) => <TextAreaField field={f} label="Descripción (opcional)" maxLength={500} />}
      </form.Field>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : course ? 'Guardar cambios' : 'Crear curso'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}