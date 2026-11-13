import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import CourseDetail from '@/features/courses/components/course-detail'
import CourseDetailSkeleton from '@/features/courses/components/course-detail-skeleton'

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <Link
        href="/admin/courses"
        className="muted inline-flex items-center gap-1.5 text-sm hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Cursos
      </Link>

      <Suspense fallback={<CourseDetailSkeleton />}>
        <CourseDetail params={params} />
      </Suspense>
    </main>
  )
}