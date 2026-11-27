'use client'

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
import { ROOM_KIND_LABELS, ROOM_KIND_OPTIONS } from '../constants'
import type { RoomRow } from '../types/room-types'
import RoomRowActions from './room-row-actions'

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

type StatusFilter = 'all' | 'active' | 'inactive'

export default function RoomsTable({
  data,
  buildings,
}: {
  data: RoomRow[]
  buildings: string[]
}) {
  const [query, setQuery] = useState('')
  const [building, setBuilding] = useState('all')
  const [kind, setKind] = useState('all')
  const [status, setStatus] = useState<StatusFilter>('all')

  const rows = useMemo(() => {
    const q = normalize(query.trim())
    return data.filter((r) => {
      if (building !== 'all' && r.building !== building) return false
      if (kind !== 'all' && r.kind !== kind) return false
      if (status === 'active' && !r.isActive) return false
      if (status === 'inactive' && r.isActive) return false
      return !q || normalize(`${r.code} ${r.name} ${r.building}`).includes(q)
    })
  }, [data, query, building, kind, status])

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-200 p-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between lg:px-6">
        <div className="relative lg:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por código, nombre o edificio"
            className="pl-9"
            aria-label="Buscar aulas"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3 lg:flex">
          <select
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            aria-label="Filtrar por edificio"
            className="input lg:w-44"
          >
            <option value="all">Todos los edificios</option>
            {buildings.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value)}
            aria-label="Filtrar por tipo"
            className="input lg:w-44"
          >
            <option value="all">Todos los tipos</option>
            {ROOM_KIND_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
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
            <option value="active">Activas</option>
            <option value="inactive">Inactivas</option>
          </select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 sm:px-6">Código</TableHead>
            <TableHead className="px-4 sm:px-6">Aula</TableHead>
            <TableHead className="hidden px-4 md:table-cell sm:px-6">Tipo</TableHead>
            <TableHead className="hidden px-4 sm:table-cell sm:px-6">Capacidad</TableHead>
            <TableHead className="hidden px-4 sm:table-cell sm:px-6">Estado</TableHead>
            <TableHead className="w-12 px-4 sm:px-6">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {rows.length ? (
            rows.map((r) => (
              <TableRow key={r.id} className={r.isActive ? '' : 'opacity-60'}>
                <TableCell className="px-4 sm:px-6">
                  <code className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-xs dark:bg-slate-800">
                    {r.code}
                  </code>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="min-w-0">
                    <p className="flex items-center gap-2 font-medium">
                      <span className="truncate">{r.name}</span>
                      {!r.isActive && <StatusBadge className="sm:hidden">Inactiva</StatusBadge>}
                    </p>
                    <p className="muted truncate text-xs">
                      {r.building || 'Sin edificio'} · {r.capacity} personas
                    </p>
                  </div>
                </TableCell>
                <TableCell className="hidden px-4 md:table-cell sm:px-6">
                  <StatusBadge tone="sky">{ROOM_KIND_LABELS[r.kind]}</StatusBadge>
                </TableCell>
                <TableCell className="hidden whitespace-nowrap px-4 sm:table-cell sm:px-6">
                  {r.capacity}
                </TableCell>
                <TableCell className="hidden px-4 sm:table-cell sm:px-6">
                  <StatusBadge tone={r.isActive ? 'emerald' : 'slate'}>
                    {r.isActive ? 'Activa' : 'Inactiva'}
                  </StatusBadge>
                </TableCell>
                <TableCell className="px-4 sm:px-6">
                  <div className="flex justify-end">
                    <RoomRowActions room={r} buildings={buildings} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center">
                <span className="muted">
                  {data.length === 0
                    ? 'Todavía no hay aulas. Crea la primera con «Nueva aula».'
                    : 'Ningún aula coincide con los filtros.'}
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="border-t border-slate-200 px-4 py-3 dark:border-slate-800 sm:px-6">
        <p className="muted text-sm">
          {rows.length} de {data.length} aulas
        </p>
      </div>
    </div>
  )
}