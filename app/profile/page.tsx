import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getSessionAndRoles } from '@/utils/supabase/roles'
import RoleBadge from '@/components/role-badge'
import ThemeToggle from '@/components/theme-toggle'
import AvatarUploader from './avatar-uploader'

async function ProfileContent() {
  const { user, roles, profile } = await getSessionAndRoles()
  if (!user) redirect('/login')

  const name = profile?.full_name ?? user.email ?? 'Usuario'

  return (
    <section className="card space-y-6 p-6">
      <AvatarUploader name={name} path={profile?.avatar_path ?? null} />

      <div className="space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
        <p className="text-lg font-semibold">{name}</p>
        <p className="muted break-all text-sm">{user.email}</p>
        <div className="flex flex-wrap gap-1.5 pt-2">
          {roles.map((r) => (
            <RoleBadge key={r} role={r} />
          ))}
        </div>
      </div>
    </section>
  )
}

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

      <Suspense fallback={<div className="h-56 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />}>
        <ProfileContent />
      </Suspense>
    </main>
  )
}