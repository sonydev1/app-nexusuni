import type { EnrollmentStatus, TermStatus } from '../lib/term-status'

export type TermRow = {
  id: string
  code: string
  // Fechas tal cual (AAAA-MM-DD), para el formulario
  startDate: string
  endDate: string
  enrollmentStart: string
  enrollmentEnd: string
  // Fechas ya formateadas, para mostrar
  startLabel: string
  endLabel: string
  enrollmentStartLabel: string
  enrollmentEndLabel: string
  isCurrent: boolean
  status: TermStatus
  enrollmentStatus: EnrollmentStatus
}