import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import NewProgramAction from '@/features/programs/components/new-program-action'
import ProgramsData from '@/features/programs/components/programs-data'
import ProgramsSkeleton from '@/features/programs/components/programs-skeleton'

export default function ProgramsPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Carreras</h1>
          <p className="muted text-sm">
            Programas académicos de cada departamento. Su plan de estudios se arma con los cursos.
          </p>
        </div>

        <Suspense
          fallback={
            <Button disabled>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nueva carrera</span>
              <span className="sm:hidden">Nueva</span>
            </Button>
          }
        >
          <NewProgramAction />
        </Suspense>
      </div>

      <Suspense fallback={<ProgramsSkeleton />}>
        <ProgramsData />
      </Suspense>
    </main>
  )
}