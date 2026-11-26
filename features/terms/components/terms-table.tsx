import StatusBadge from '@/components/status-badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  ENROLLMENT_STATUS_LABELS,
  TERM_STATUS_LABELS,
  type EnrollmentStatus,
  type TermStatus,
} from '../lib/term-status'
import type { TermRow } from '../types/term-types'
import TermRowActions from './term-row-actions'

const TERM_TONES: Record<TermStatus, 'sky' | 'emerald' | 'slate'> = {
  upcoming: 'sky',
  in_progress: 'emerald',
  finished: 'slate',
}

const ENROLLMENT_TONES: Record<EnrollmentStatus, 'sky' | 'emerald' | 'slate'> = {
  upcoming: 'sky',
  open: 'emerald',
  closed: 'slate',
}

export default function TermsTable({ data }: { data: TermRow[] }) {
  return (
    <div className="card overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-4 sm:px-6">Periodo</TableHead>
            <TableHead className="hidden px-4 md:table-cell sm:px-6">Fechas</TableHead>
            <TableHead className="hidden px-4 lg:table-cell sm:px-6">Matrícula</TableHead>
            <TableHead className="px-4 sm:px-6">Estado</TableHead>
            <TableHead className="w-12 px-4 sm:px-6">
              <span className="sr-only">Acciones</span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.length ? (
            data.map((t) => (
              <TableRow key={t.id} className={t.isCurrent ? 'bg-indigo-50/60 dark:bg-indigo-500/10' : ''}>
                <TableCell className="px-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{t.code}</span>
                    {t.isCurrent && <StatusBadge tone="emerald">Vigente</StatusBadge>}
                  </div>
                  <p className="muted text-xs md:hidden">
                    {t.startLabel} – {t.endLabel}
                  </p>
                </TableCell>

                <TableCell className="hidden whitespace-nowrap px-4 md:table-cell sm:px-6">
                  {t.startLabel} – {t.endLabel}
                </TableCell>

                <TableCell className="hidden px-4 lg:table-cell sm:px-6">
                  <p className="whitespace-nowrap">
                    {t.enrollmentStartLabel} – {t.enrollmentEndLabel}
                  </p>
                  <StatusBadge tone={ENROLLMENT_TONES[t.enrollmentStatus]} className="mt-1">
                    {ENROLLMENT_STATUS_LABELS[t.enrollmentStatus]}
                  </StatusBadge>
                </TableCell>

                <TableCell className="px-4 sm:px-6">
                  <StatusBadge tone={TERM_TONES[t.status]}>{TERM_STATUS_LABELS[t.status]}</StatusBadge>
                </TableCell>

                <TableCell className="px-4 sm:px-6">
                  <div className="flex justify-end">
                    <TermRowActions term={t} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center">
                <span className="muted">
                  Todavía no hay periodos. Crea el primero con «Nuevo periodo».
                </span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}