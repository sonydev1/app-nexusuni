import Link from 'next/link'
import { notFound } from 'next/navigation'
import { connection } from 'next/server'
import { BookOpen } from 'lucide-react'
import InfoCard from '@/components/info-card'
import StatusBadge from '@/components/status-badge'
import { getDepartmentOptions } from '@/features/programs/services/queries'
import { getCourseDetail, getCourseOptions } from '../services/queries'
import type { CourseRef } from '../types/course-types'
import CourseRowActions from './course-row-actions'

function CourseList({
  title,
  items,
  empty,
}: {
  title: string
  items: CourseRef[]
  empty: string
}) {
  return (
    <section className="card p-4 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      {items.length ? (
        <ul className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {items.map((c) => (
            <li key={c.id}>
              <Link
                href={`/admin/courses/${c.id}`}
                className="flex items-center gap-3 py-2.5 text-sm hover:underline"
              >
                <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
                  {c.code}
                </code>
                <span className="truncate">{c.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="muted mt-4 text-sm">{empty}</p>
      )}
    </section>
  )
}

export default async function CourseDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params

  const [course, departments, courseOptions] = await Promise.all([
    getCourseDetail(id),
    getDepartmentOptions(),
    getCourseOptions(),
  ])
  if (!course) notFound()

  return (
    <div className="space-y-6">
      <header className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
              {course.code}
            </code>
            <StatusBadge tone="sky">
              {course.credits} {course.credits === 1 ? 'crédito' : 'créditos'}
            </StatusBadge>
            <StatusBadge>{course.weeklyHours} h semanales</StatusBadge>
            <StatusBadge tone={course.isActive ? 'emerald' : 'slate'}>
              {course.isActive ? 'Activo' : 'Inactivo'}
            </StatusBadge>
            {!course.departmentActive && (
              <StatusBadge tone="amber">Departamento inactivo</StatusBadge>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{course.name}</h1>
          <p className="muted text-sm">{course.departmentName}</p>
        </div>

        <CourseRowActions
          course={course}
          departments={departments}
          courseOptions={courseOptions}
          showDetail={false}
          redirectOnDelete
          triggerLabel="Acciones"
        />
      </header>

      <InfoCard
        title="Información general"
        items={[
          ['Departamento', `${course.departmentCode} · ${course.departmentName}`],
          ['Créditos', String(course.credits)],
          ['Horas semanales', String(course.weeklyHours)],
          ['Creado', course.createdLabel],
          ['Descripción', course.description],
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <CourseList
          title="Prerrequisitos"
          items={course.prerequisites}
          empty="No tiene prerrequisitos."
        />
        <CourseList
          title="Es prerrequisito de"
          items={course.requiredBy}
          empty="Ningún curso lo requiere."
        />
      </div>

      <section className="card p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Carreras donde aparece</h2>
          <StatusBadge tone="amber">Próximamente</StatusBadge>
        </div>
        <div className="mt-4 flex flex-col items-center gap-2 rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center dark:border-slate-700">
          <BookOpen className="h-6 w-6 text-slate-400" />
          <p className="muted max-w-md text-xs">
            Cuando exista el plan de estudios, aquí verás en qué carreras y semestres se dicta
            este curso.
          </p>
        </div>
      </section>
    </div>
  )
}