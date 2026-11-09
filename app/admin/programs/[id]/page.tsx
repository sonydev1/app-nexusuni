import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ProgramDetail from '@/features/programs/components/program-detail'
import ProgramDetailSkeleton from '@/features/programs/components/program-detail-skeleton'

export default function ProgramDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <Link
        href="/admin/programs"
        className="muted inline-flex items-center gap-1.5 text-sm hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Carreras
      </Link>

      <Suspense fallback={<ProgramDetailSkeleton />}>
        <ProgramDetail params={params} />
      </Suspense>
    </main>
  )
}