'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import StatusBadge from '@/components/status-badge'
import type { DepartmentOption } from '@/features/programs/types/program-types'
import type { CourseOption, CourseRow } from '../types/course-types'
import CourseRowActions from './course-row-actions'

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

type StatusFilter = 'all' | 'active' | 'inactive'
const MAX_CHIPS = 3

export default function CoursesTable({
  data,
  departments,
  courseOptions,
}: {
  data: CourseRow[]
  departments: DepartmentOption[]
  courseOptions: CourseOption[]
}) {
  const [query, setQuery] = useState('')
  const [departmentId, setDepartmentId] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const rows = useMemo(() => {
    const q = normalize(query.trim())
    return data.filter((c) => {
      if (departmentId !== 'all' && c.departmentId !== departmentId) return false
      if (status === 'active' && !c.isActive) return false
      if (status === 'inactive' && c.isActive) return false
      if (!q) return true
      const prerequisites = c.prerequisites.map((p) => p.code).join(' ')
      return normalize(`${c.code} ${c.name} ${c.departmentName} ${prerequisites}`).includes(q)
    })
  }, [data, query, departmentId, status])

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="relative lg:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, nombre o departamento"
            className="pl-9"
            aria-label="Buscar cursos"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:flex">
          <select
            value={departmentId}
            onChange={(e) => setDepartmentId(e.target.value)}
            aria-label="Filtrar por departamento"
            className="input lg:w-52"
          >
            <option value="all">Todos los departamentos</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as StatusFilter)}
            aria-label="Filtrar por estado"
            className="input lg:w-40"
          >
            <option value="all">Todos los estados</option>
            <option value="active">Activos</option>
            <option value="inactive">Inactivos</option>
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 sm:px-6">Código</TableHead>
            <TableHead className="px-4 sm:px-6">Curso</TableHead>
            <TableHead className="px-4 sm:px-6">Créd.</TableHead>
            <TableHead className="hidden px-4 lg:table-cell sm:px-6">Horas</TableHead>
            <TableHead className="hidden px-4 md:table-cell sm:px-6">Prerrequisitos</TableHead>
            <TableHead className="hidden px-4 sm:table-cell sm:px-6">Estado</TableHead>
            <TableHead className="w-12 px-4 sm:px-6">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((c) => (
              <TableRow key={c.id} className={c.isActive ? '' : 'opacity-60'}>
                <TableCell className="px-4 sm:px-6">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
                    {c.code}
                  </code>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      <Link href={`/admin/courses/${c.id}`} className="truncate hover:underline">
                        {c.name}
                      </Link>
                      {!c.isActive && <StatusBadge className="sm:hidden">Inactivo</StatusBadge>}
                    </p>
                    <p className="muted truncate text-xs">{c.departmentName}</p>
                  </div>
                </TableCell>
                <TableCell className="px-4 sm:px-6">{c.credits}</TableCell>
                <TableCell className="hidden whitespace-nowrap px-4 lg:table-cell sm:px-6">
                  {c.weeklyHours} h
                </TableCell>
                <TableCell className="hidden px-4 md:table-cell sm:px-6">
                  {c.prerequisites.length ? (
                    <div className="flex flex-wrap gap-1">
                      {c.prerequisites.slice(0, MAX_CHIPS).map((p) => (
                        <StatusBadge key={p.id} tone="sky" title={p.name}>
                          {p.code}
                        </StatusBadge>
                      ))}
                      {c.prerequisites.length > MAX_CHIPS && (
                        <StatusBadge>+{c.prerequisites.length - MAX_CHIPS}</StatusBadge>
                      )}
                    </div>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </TableCell>
                <TableCell className="hidden px-4 sm:table-cell sm:px-6">
                  <StatusBadge tone={c.isActive ? 'emerald' : 'slate'}>
                    {c.isActive ? 'Activo' : 'Inactivo'}
                  </StatusBadge>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="flex justify-end">
                    <CourseRowActions
                      course={c}
                      departments={departments}
                      courseOptions={courseOptions}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-32 text-center">
                <span className="muted">
                  {data.length === 0
                    ? 'Todavía no hay cursos. Crea el primero con «Nuevo curso».'
                    : 'Ningún curso coincide con los filtros.'}
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        <p className="muted text-sm">
          {rows.length} de {data.length} cursos
        </p>
      </div>
    </div>
  )
}