import { TableSkeleton } from '@/components/page-skeletons'

export default function DepartmentsSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando departamentos…</span>
      <TableSkeleton
        rows={6}
        pagination={false}
        columns={[
          { kind: 'text', width: 'w-14' }, 
          { kind: 'title' }, 
          { kind: 'text', width: 'w-8' },
          { kind: 'badges' }, 
          { kind: 'text', width: 'w-24' }, 
          { kind: 'actions' },
        ]}
      />
    </div>
  )
}