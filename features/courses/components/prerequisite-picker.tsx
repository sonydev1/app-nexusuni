'use client'

import { useMemo, useState } from 'react'
import { Plus, Search, X } from 'lucide-react'
import type { CourseOption } from '../types/course-types'

const normalize = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '')

export default function PrerequisitePicker({
  value,
  onChange,
  options,
  excludeId,
  max = 10,
}: {
  value: string[]
  onChange: (ids: string[]) => void
  options: CourseOption[]
  excludeId?: string // el curso que se está editando: no puede ser su propio prerrequisito
  max?: number
}) {
  const [query, setQuery] = useState('')

  const byId = useMemo(() => new Map(options.map((o) => [o.id, o])), [options])
  const selected = value.map((id) => byId.get(id)).filter((o): o is CourseOption => !!o)
  const full = value.length >= max

  const available = useMemo(() => {
    const q = normalize(query.trim())
    return options
      .filter(
        (o) =>
          o.id !== excludeId &&
          o.isActive &&
          !value.includes(o.id) &&
          (!q || normalize(`${o.code} ${o.name}`).includes(q))
      )
      .slice(0, 8)
  }, [options, excludeId, value, query])

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-1.5">
          {selected.map((o) => (
            <li
              key={o.id}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-50 py-0.5 pl-2.5 pr-1 text-xs font-medium text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300"
            >
              <span title={o.name}>
                {o.code}
                {!o.isActive && ' (inactivo)'}
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((id) => id !== o.id))}
                aria-label={`Quitar ${o.code}`}
                className="rounded-full p-0.5 hover:bg-indigo-100 dark:hover:bg-indigo-500/30"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {full ? (
        <p className="muted text-xs">Llegaste al máximo de {max} prerrequisitos.</p>
      ) : (
        <>
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar curso por código o nombre"
              aria-label="Buscar prerrequisito"
              className="input pl-9"
            />
          </div>

          <ul className="max-h-44 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 dark:divide-slate-700 dark:border-slate-700">
            {available.length ? (
              available.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    onClick={() => onChange([...value, o.id])}
                    className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <Plus className="h-4 w-4 shrink-0 text-slate-400" />
                    <code className="font-mono text-xs">{o.code}</code>
                    <span className="truncate">{o.name}</span>
                  </button>
                </li>
              ))
            ) : (
              <li className="muted px-3 py-3 text-center text-xs">
                {options.length === 0 ? 'Todavía no hay otros cursos.' : 'Sin resultados.'}
              </li>
            )}
          </ul>
        </>
      )}
    </div>
  )
}