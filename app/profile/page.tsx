import { Suspense } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import ThemeToggle from '@/components/theme-toggle'
import ProfileContent from '@/features/profiles/components/profile-content'
import ProfileSkeleton from '@/features/profiles/components/profile-skeleton'

export default function ProfilePage() {
  return (
    <main className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Link>
        <ThemeToggle />
      </header>

      <h1 className="text-2xl font-bold tracking-tight">Mi perfil</h1>

      <Suspense fallback={<ProfileSkeleton />}>
        <ProfileContent />
      </Suspense>
    </main>
  )
}