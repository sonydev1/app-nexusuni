'use client'

import { useMemo, useState, useTransition } from 'react'
import { Loader2, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PLAN_KIND_OPTIONS, type PlanKind } from '../constants'
import { addCourseToPlan, updatePlanCourse } from '../services/plan-actions'
import type { PlanCandidate, PlanCourse } from '../types/plan-types'

export type PlanDialogMode =
  | { type: 'add'; candidates: PlanCandidate[] }
  | { type: 'edit'; course: PlanCourse }

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

function PlanCourseForm({
  programId,
  durationSemesters,
  mode,
  onDone,
}: {
  programId: string
  durationSemesters: number
  mode: PlanDialogMode
  onDone: () => void
}) {
  const [courseId, setCourseId] = useState('')
  const [query, setQuery] = useState('')
  const [semester, setSemester] = useState(mode.type === 'edit' ? String(mode.course.semester) : '1')
  const [kind, setKind] = useState<PlanKind>(mode.type === 'edit' ? mode.course.kind : 'required')
  const [error, setError] = useState<string | null>(null)
  const [pending, startTransition] = useTransition()

  const candidates = mode.type === 'add' ? mode.candidates : []
  const selected = candidates.find((c) => c.id === courseId)

  const results = useMemo(() => {
    const q = normalize(query.trim())
    return candidates
      .filter((c) => !q || normalize(`${c.code} ${c.name}`).includes(q))
      .slice(0, 8)
  }, [candidates, query])

  function submit() {
    setError(null)
    if (mode.type === 'add' && !courseId) {
      setError('Selecciona un curso')
      return
    }

    startTransition(async () => {
      const input = {
        programId,
        courseId: mode.type === 'add' ? courseId : mode.course.courseId,
        semester: Number(semester),
        kind,
      }
      const res = mode.type === 'add' ? await addCourseToPlan(input) : await updatePlanCourse(input)

      if (res.error) setError(res.error)
      else {
        toast.success(res.success)
        onDone()
      }
    })
  }

  return (
    <div className="space-y-4">
      {error && <div className="alert-error">{error}</div>}

      {mode.type === 'add' && (
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Curso</label>

          {selected ? (
            <div className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700">
              <span className="min-w-0 truncate">
                <code className="mr-2 font-mono text-xs">{selected.code}</code>
                {selected.name}
                <span className="muted ml-2 text-xs">{selected.credits} créd.</span>
              </span>
              <button
                type="button"
                onClick={() => setCourseId('')}
                aria-label="Cambiar curso"
                className="rounded p-1 hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar por código o nombre"
                  aria-label="Buscar curso"
                  className="input pl-9"
                />
              </div>
              <ul className="max-h-48 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
                {results.length ? (
                  results.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setCourseId(c.id)}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                      >
                        <code className="font-mono text-xs">{c.code}</code>
                        <span className="min-w-0 flex-1 truncate">{c.name}</span>
                        <span className="muted shrink-0 text-xs">{c.credits} créd.</span>
                      </button>
                    </li>
                  ))
                ) : (
                  <li className="muted px-3 py-3 text-center text-xs">
                    {candidates.length === 0
                      ? 'No quedan cursos activos por agregar.'
                      : 'Sin resultados.'}
                  </li>
                )}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="plan-semester" className="text-sm font-medium">
            Semestre
          </label>
          <select
            id="plan-semester"
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="input"
          >
            {Array.from({ length: durationSemesters }, (_, i) => i + 1).map((n) => (
              <option key={n} value={n}>
                Semestre {n}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="plan-kind" className="text-sm font-medium">
            Tipo
          </label>
          <select
            id="plan-kind"
            value={kind}
            onChange={(e) => setKind(e.target.value as PlanKind)}
            className="input"
          >
            {PLAN_KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onDone} disabled={pending}>
          Cancelar
        </Button>
        <Button onClick={submit} disabled={pending}>
          {pending && <Loader2 className="h-4 w-4 animate-spin" />}
          {mode.type === 'add' ? 'Agregar al plan' : 'Guardar cambios'}
        </Button>
      </DialogFooter>
    </div>
  )
}

export default function PlanCourseDialog({
  open,
  onOpenChange,
  programId,
  durationSemesters,
  mode,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  programId: string
  durationSemesters: number
  mode: PlanDialogMode
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode.type === 'add' ? 'Agregar curso al plan' : `Editar ${mode.course.code}`}
          </DialogTitle>
          <DialogDescription>
            {mode.type === 'add' ? 'Solo se ofrecen cursos activos que aún no están en el plan.' : mode.course.name}
          </DialogDescription>
        </DialogHeader>

        {/* Se desmonta al cerrar: el formulario siempre arranca limpio */}
        <PlanCourseForm
          programId={programId}
          durationSemesters={durationSemesters}
          mode={mode}
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}