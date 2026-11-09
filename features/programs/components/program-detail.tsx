import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { BookOpen } from 'lucide-react'
import InfoCard from '@/components/info-card'
import StatusBadge from '@/components/status-badge'
import { PROGRAM_LEVEL_LABELS } from '../constants'
import { getDepartmentOptions, getProgramDetail } from '../services/queries'
import ProgramRowActions from './program-row-actions'

export default async function ProgramDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params

  const [program, departments] = await Promise.all([getProgramDetail(id), getDepartmentOptions()])
  if (!program) notFound()

  return (
    <div className="space-y-6">
      <header className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
              {program.code}
            </code>
            <StatusBadge tone="sky">{PROGRAM_LEVEL_LABELS[program.level]}</StatusBadge>
            <StatusBadge tone={program.isActive ? 'emerald' : 'slate'}>
              {program.isActive ? 'Activa' : 'Inactiva'}
            </StatusBadge>
            {!program.departmentActive && (
              <StatusBadge tone="amber">Departamento inactivo</StatusBadge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{program.name}</h1>
          <p className="muted text-sm">{program.departmentName}</p>
        </div>

        <ProgramRowActions
          program={program}
          departments={departments}
          showDetail={false}
          redirectOnDelete
          triggerLabel="Acciones"
        />
      </header>

      <InfoCard
        title="Información general"
        items={[
          ['Departamento', `${program.departmentCode} · ${program.departmentName}`],
          ['Nivel', PROGRAM_LEVEL_LABELS[program.level]],
          ['Duración', `${program.durationSemesters} semestres`],
          ['Meta de créditos', `${program.totalCredits} créditos`],
          ['Creada', program.createdLabel],
          ['Descripción', program.description],
        ]}
      />

      <section className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Plan de estudios</h2>
          <StatusBadge tone="amber">Próximamente</StatusBadge>
        </div>

        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-10 text-center dark:border-slate-700">
          <BookOpen className="h-6 w-6 text-slate-400" />
          <p className="text-sm font-medium">Todavía no hay cursos en el plan</p>
          <p className="muted max-w-md text-xs">
            El plan se arma con los cursos de la carrera, ordenados por semestre. Cuando existan,
            aquí verás los créditos acumulados frente a la meta de {program.totalCredits}.
          </p>
        </div>
      </section>
    </div>
  )
}