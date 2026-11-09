import { TableSkeleton } from '@/components/page-skeletons'

export default function ProgramsSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando carreras…</span>
      <TableSkeleton
        rows={6}
        pagination={false}
        columns={[
          { kind: 'text', width: 'w-14' }, // código
          { kind: 'title' }, // carrera y departamento
          { kind: 'badges' }, // nivel
          { kind: 'text', width: 'w-28' }, // duración
          { kind: 'badges' }, // estado
          { kind: 'actions' },
        ]}
      />
    </div>
  )
}