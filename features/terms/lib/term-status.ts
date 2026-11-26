export type TermStatus = 'upcoming' | 'in_progress' | 'finished'
export type EnrollmentStatus = 'upcoming' | 'open' | 'closed'

export const TERM_STATUS_LABELS: Record<TermStatus, string> = {
  upcoming: 'Próximo',
  in_progress: 'En curso',
  finished: 'Terminado',
}

export const ENROLLMENT_STATUS_LABELS: Record<EnrollmentStatus, string> = {
  upcoming: 'Matrícula próxima',
  open: 'Matrícula abierta',
  closed: 'Matrícula cerrada',
}

// Fecha de hoy en Colombia (AAAA-MM-DD). Usar solo después de `await connection()`.
export function todayInBogota() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Bogota',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

export function termStatus(start: string, end: string, today: string): TermStatus {
  if (today < start) return 'upcoming'
  if (today > end) return 'finished'
  return 'in_progress'
}

export function enrollmentStatus(start: string, end: string, today: string): EnrollmentStatus {
  if (today < start) return 'upcoming'
  if (today > end) return 'closed'
  return 'open'
}