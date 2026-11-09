import { Suspense } from 'react'
import DepartmentsData from '@/features/departments/components/departments-data'
import DepartmentsSkeleton from '@/features/departments/components/departments-skeleton'
import NewDepartmentButton from '@/features/departments/components/new-department-button'

export default function DepartmentsPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Departamentos</h1>
          <p className="muted text-sm">
            Organiza las áreas académicas. Las carreras y los cursos se asignan a un departamento.
          </p>
        </div>
        <NewDepartmentButton />
      </div>

      <Suspense fallback={<DepartmentsSkeleton />}>
        <DepartmentsData />
      </Suspense>
    </main>
  )
}