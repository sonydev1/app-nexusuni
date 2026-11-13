import { TableSkeleton } from '@/components/page-skeletons'

export default function CoursesSkeleton() {
  return (
    <div role="status" aria-busy="true">
      <span className="sr-only">Cargando cursos…</span>
      <TableSkeleton
        rows={8}
        pagination={false}
        columns={[
          { kind: 'text', width: 'w-16' }, // código
          { kind: 'title' }, // curso y departamento
          { kind: 'text', width: 'w-6' }, // créditos
          { kind: 'badges' }, // prerrequisitos
          { kind: 'badges' }, // estado
          { kind: 'actions' },
        ]}
      />
    </div>
  )
}