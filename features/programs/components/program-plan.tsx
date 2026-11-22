import Link from 'next/link'
import { connection } from 'next/server'
import { AlertTriangle } from 'lucide-react'
import StatusBadge from '@/components/status-badge'
import { PLAN_KIND_LABELS } from '../constants'
import { analyzePlan } from '../lib/plan-analysis'
import { getProgramPlan } from '../services/plan-queries'
import type { PlanCourse } from '../types/plan-types'
import type { ProgramDetail } from '../types/program-types'
import AddPlanCourseButton from './add-plan-course-button'
import PlanRowActions from './plan-row-actions'

export default async function ProgramPlan({ program }: { program: ProgramDetail }) {
  await connection()

  const { courses, candidates } = await getProgramPlan(program.id)
  const analysis = analyzePlan(courses)

  const semesters = Array.from({ length: program.durationSemesters }, (_, i) => i + 1)
  const bySemester = new Map<number, PlanCourse[]>()
  for (const c of courses) {
    bySemester.set(c.semester, [...(bySemester.get(c.semester) ?? []), c])
  }

  const difference = program.totalCredits - analysis.totalCredits
  const percent = Math.min(100, Math.round((analysis.totalCredits / program.totalCredits) * 100))
  const barColor =
    difference === 0 ? 'bg-emerald-500' : difference < 0 ? 'bg-amber-500' : 'bg-sky-500'

  return (
    <section className="space-y-4">
      <div className="card space-y-4 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="font-semibold">Plan de estudios</h2>
          <AddPlanCourseButton
            programId={program.id}
            durationSemesters={program.durationSemesters}
            candidates={candidates}
          />
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
            <p>
              <span className="text-lg font-bold">{analysis.totalCredits}</span>
              <span className="muted"> de {program.totalCredits} créditos</span>
            </p>
            <p className="muted text-xs">
              {analysis.requiredCredits} obligatorios · {analysis.electiveCredits} electivos ·{' '}
              {courses.length} {courses.length === 1 ? 'curso' : 'cursos'}
            </p>
          </div>

          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={percent}
            aria-label="Créditos del plan frente a la meta"
            className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800"
          >
            <div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
          </div>

          <p className="muted text-xs">
            {difference > 0
              ? `Faltan ${difference} créditos para la meta.`
              : difference === 0
                ? 'Cumple la meta de créditos.'
                : `Supera la meta por ${-difference} créditos.`}
          </p>
        </div>
      </div>

      {analysis.issues.length > 0 && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/30 dark:bg-amber-500/10 sm:p-5">
          <p className="flex items-center gap-2 text-sm font-medium text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-4 w-4" />
            {analysis.issues.length === 1
              ? '1 aviso en el plan'
              : `${analysis.issues.length} avisos en el plan`}
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-amber-800 dark:text-amber-200">
            {analysis.issues.map((issue, i) => (
              <li key={i}>{issue.message}</li>
            ))}
          </ul>
        </div>
      )}

      {semesters.map((n) => {
        const list = bySemester.get(n) ?? []
        const credits = list.reduce((sum, c) => sum + c.credits, 0)

        return (
          <div key={n} className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
              <h3 className="text-sm font-semibold">Semestre {n}</h3>
              <span className="muted text-xs">{credits} créditos</span>
            </div>

            {list.length ? (
              <ul className="divide-y divide-slate-100 dark:divide-slate-800">
                {list.map((c) => (
                  <li
                    key={c.courseId}
                    className={`flex items-center justify-between gap-3 px-4 py-3 sm:px-6 ${c.isActive ? '' : 'opacity-60'}`}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <code className="shrink-0 rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
                        {c.code}
                      </code>
                      <div className="min-w-0">
                        <Link
                          href={`/admin/courses/${c.courseId}`}
                          className="block truncate text-sm font-medium hover:underline"
                        >
                          {c.name}
                        </Link>
                        {c.prerequisites.length > 0 && (
                          <p className="muted truncate text-xs">
                            Requiere: {c.prerequisites.map((p) => p.code).join(', ')}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-1.5">
                      <StatusBadge
                        tone={c.kind === 'required' ? 'sky' : 'violet'}
                        className="hidden sm:inline-flex"
                      >
                        {PLAN_KIND_LABELS[c.kind]}
                      </StatusBadge>
                      <StatusBadge>{c.credits} créd.</StatusBadge>
                      {!c.isActive && <StatusBadge tone="amber">Inactivo</StatusBadge>}
                      <PlanRowActions
                        programId={program.id}
                        durationSemesters={program.durationSemesters}
                        course={c}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted px-4 py-5 text-center text-xs sm:px-6">
                Sin cursos en este semestre.
              </p>
            )}
          </div>
        )
      })}
    </section>
  )
}