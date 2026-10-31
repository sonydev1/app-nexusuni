import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import UserDetail from '@/features/users/components/user-detail'
import UserDetailSkeleton from '@/features/users/components/user-detail-skeleton'

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main className="space-y-6 p-4 md:p-8">
      <Link
        href="/admin/users"
        className="muted inline-flex items-center gap-1.5 text-sm hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Usuarios
      </Link>

      <Suspense fallback={<UserDetailSkeleton />}>
        <UserDetail params={params} />
      </Suspense>
    </main>
  )
}
