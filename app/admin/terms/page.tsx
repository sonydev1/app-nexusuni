import { Suspense } from 'react'
import NewTermButton from '@/features/terms/components/new-term-button'
import TermsData from '@/features/terms/components/terms-data'
import TermsSkeleton from '@/features/terms/components/terms-skeleton'

export default function TermsPage() {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Periodos académicos</h1>
          <p className="muted text-sm">
            Las secciones y las matrículas pertenecen a un periodo. Solo uno es el vigente.
          </p>
        </div>
        <NewTermButton />
      </div>

      <Suspense fallback={<TermsSkeleton />}>
        <TermsData />
      </Suspense>
    </main>
  )
}