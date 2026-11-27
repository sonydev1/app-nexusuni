import { TableSkeleton } from '@/components/page-skeletons'

export default function RoomsSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando aulas…</span>
      <TableSkeleton
        rows={6}
        pagination={false}
        columns={[
          { kind: 'text', width: 'w-14' }, // código
          { kind: 'title' }, // aula y edificio
          { kind: 'badges' }, // tipo
          { kind: 'text', width: 'w-10' }, // capacidad
          { kind: 'badges' }, // estado
          { kind: 'actions' },
        ]}
      />
    </div>
  )
}