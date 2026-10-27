import { StatCardsSkeleton, TableSkeleton } from '@/components/page-skeletons'

export default function UsersSkeleton() {
  return (
    <div role="status" aria-busy="true" className="space-y-6">
      <span className="sr-only">Cargando usuarios…</span>

      <StatCardsSkeleton count={4} icon={false} className="grid-cols-2 lg:grid-cols-4" />

      <TableSkeleton
        rows={8}
        columns={[
          { kind: 'user' },
          { kind: 'text', width: 'w-28' }, // documento
          { kind: 'badges' }, // roles
          { kind: 'text', width: 'w-24' }, // fecha
          { kind: 'actions' },
        ]}
      />
    </div>
  )
}