import type { ProgramOption } from '@/features/programs/types/program-types'

// Las carreras inactivas no se ofrecen, salvo la que el estudiante ya tiene
export function programSelectOptions(programs: ProgramOption[], currentId?: string) {
  return [
    { value: '', label: 'Selecciona una carrera' },
    ...programs
      .filter((p) => p.isActive || p.id === currentId)
      .map((p) => ({
        value: p.id,
        label: `${p.code} · ${p.name}${p.isActive ? '' : ' (inactiva)'}`,
      })),
  ]
}