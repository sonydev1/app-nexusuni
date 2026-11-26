'use client'

import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertCircle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TextField } from '@/components/form/fields'
import { termSchema, type TermValues } from '../schemas/term-schema'
import { createTerm, updateTerm } from '../services/term-actions'
import type { TermRow } from '../types/term-types'

export default function TermForm({
  term,
  onSuccess,
}: {
  term?: TermRow
  onSuccess: (message: string) => void
}) {
  const [error, setError] = useState<string | null>(null)

  const defaultValues: TermValues = {
    code: term?.code ?? '',
    start_date: term?.startDate ?? '',
    end_date: term?.endDate ?? '',
    enrollment_start: term?.enrollmentStart ?? '',
    enrollment_end: term?.enrollmentEnd ?? '',
  }

  const form = useForm({
    defaultValues,
    validators: { onSubmit: termSchema },
    onSubmit: async ({ value }) => {
      setError(null)
      const res = term ? await updateTerm(term.id, value) : await createTerm(value)

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

      <form.Field name="code">
        {(f) => <TextField field={f} label="Código" placeholder="Ej: 2026-2" />}
      </form.Field>
      <p className="muted -mt-2 text-xs">Año y número de periodo: 2026-1, 2026-2…</p>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Periodo
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="start_date">
            {(f) => <TextField field={f} label="Inicio" type="date" />}
          </form.Field>
          <form.Field name="end_date">
            {(f) => <TextField field={f} label="Fin" type="date" />}
          </form.Field>
        </div>
      </div>

      <div className="space-y-3 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Matrícula
        </p>
        <div className="grid gap-4 sm:grid-cols-2">
          <form.Field name="enrollment_start">
            {(f) => <TextField field={f} label="Apertura" type="date" />}
          </form.Field>
          <form.Field name="enrollment_end">
            {(f) => <TextField field={f} label="Cierre" type="date" />}
          </form.Field>
        </div>
        <p className="muted text-xs">
          Puede abrir antes de que empiece el periodo y cierra a más tardar el último día.
        </p>
      </div>

      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(isSubmitting) => (
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isSubmitting ? 'Guardando...' : term ? 'Guardar cambios' : 'Crear periodo'}
          </Button>
        )}
      </form.Subscribe>
    </form>
  )
}