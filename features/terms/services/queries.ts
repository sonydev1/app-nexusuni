import 'server-only'
import { createAdminClient } from '@/utils/supabase/admin'
import { requireAdmin } from '@/lib/auth/require-admin'
import { enrollmentStatus, termStatus, todayInBogota } from '../lib/term-status'
import type { TermRow } from '../types/term-types'

// Las fechas sin hora se leen como UTC para que no se corran un día
const shortDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString('es-CO', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  })

// Llámala solo después de `await connection()`: calcula "hoy"
export async function getTerms(): Promise<TermRow[]> {
  if (!(await requireAdmin())) throw new Error('No autorizado')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('academic_terms')
    .select('id, code, start_date, end_date, enrollment_start, enrollment_end, is_current')
    .order('start_date', { ascending: false })
  if (error) throw new Error('No se pudieron cargar los periodos')

  const today = todayInBogota()

  return (data ?? []).map((t) => ({
    id: t.id,
    code: t.code,
    startDate: t.start_date,
    endDate: t.end_date,
    enrollmentStart: t.enrollment_start,
    enrollmentEnd: t.enrollment_end,
    startLabel: shortDate(t.start_date),
    endLabel: shortDate(t.end_date),
    enrollmentStartLabel: shortDate(t.enrollment_start),
    enrollmentEndLabel: shortDate(t.enrollment_end),
    isCurrent: t.is_current,
    status: termStatus(t.start_date, t.end_date, today),
    enrollmentStatus: enrollmentStatus(t.enrollment_start, t.enrollment_end, today),
  }))
}