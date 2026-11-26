import { TableSkeleton } from '@/components/page-skeletons'

export default function TermsSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando periodos…</span>
      <TableSkeleton
        rows={4}
        toolbar={false}
        pagination={false}
        columns={[
          { kind: 'title' }, // periodo
          { kind: 'text', width: 'w-40' }, // fechas
          { kind: 'badges' }, // estado
          { kind: 'actions' },
        ]}
      />
    </div>
  )
}