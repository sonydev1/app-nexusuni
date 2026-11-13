import { Suspense } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CoursesData from '@/features/courses/components/courses-data'
import CoursesSkeleton from '@/features/courses/components/courses-skeleton'
import NewCourseAction from '@/features/courses/components/new-course-action'

export default function CoursesPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cursos</h1>
          <p className="muted text-sm">
            Materias con sus créditos y prerrequisitos. Se organizan por carrera en el plan de
            estudios.
          </p>
        </div>

        <Suspense
          fallback={
            <Button disabled>
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Nuevo curso</span>
              <span className="sm:hidden">Nuevo</span>
            </Button>
          }
        >
          <NewCourseAction />
        </Suspense>
      </div>

      <Suspense fallback={<CoursesSkeleton />}>
        <CoursesData />
      </Suspense>
    </main>
  )
}