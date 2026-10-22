import { Suspense } from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { GraduationCap, LogOut } from 'lucide-react'
import { createClient } from '@/utils/supabase/server'
import { getSessionAndRoles } from '@/utils/supabase/roles'
import Avatar from '@/components/avatar'
import RoleBadge from '@/components/role-badge'
import ThemeToggle from '@/components/theme-toggle'
import { logout } from './actions'

function InfoCard({ title, items }: { title: string; items: [string, string | null | undefined][] }) {
  return (
    <section className="card p-4 sm:p-6">
      <h2 className="font-semibold">{title}</h2>
      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        {items.map(([label, value]) => (
          <div key={label}>
            <dt className="muted text-xs uppercase tracking-wide">{label}</dt>
            <dd className="mt-0.5 text-sm font-medium">{value || '—'}</dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

async function RoleCards({ userId, roles }: { userId: string; roles: string[] }) {
  const supabase = await createClient()

  const [student, teacher, staff] = await Promise.all([
    roles.includes('student')
      ? supabase.from('students').select('*').eq('user_id', userId).maybeSingle()
      : null,
    roles.includes('teacher')
      ? supabase.from('teachers').select('*').eq('user_id', userId).maybeSingle()
      : null,
    roles.includes('staff')
      ? supabase.from('staff').select('*').eq('user_id', userId).maybeSingle()
      : null,
  ])

  const STATUS: Record<string, string> = {
    active: 'Activo',
    inactive: 'Inactivo',
    graduated: 'Graduado',
  }

  return (
    <>
      {student?.data && (
        <InfoCard
          title="Información de estudiante"
          items={[
            ['Código estudiantil', student.data.student_code],
            ['Estado', STATUS[student.data.status] ?? student.data.status],
            ['Fecha de ingreso', student.data.admission_date],
          ]}
        />
      )}
      {teacher?.data && (
        <InfoCard
          title="Información de docente"
          items={[
            ['Código de empleado', teacher.data.employee_code],
            ['Especialidad', teacher.data.specialty],
            ['Título académico', teacher.data.academic_degree],
            ['Fecha de contratación', teacher.data.hire_date],
          ]}
        />
      )}
      {staff?.data && (
        <InfoCard
          title="Información administrativa"
          items={[
            ['Código de empleado', staff.data.employee_code],
            ['Cargo', staff.data.position],
            ['Área', staff.data.area],
            ['Fecha de contratación', staff.data.hire_date],
          ]}
        />
      )}
    </>
  )
}

async function Home() {
  const { user, roles, profile } = await getSessionAndRoles()

  if (!user) redirect('/login')
  if (roles.includes('admin')) redirect('/admin')

  const name = profile?.full_name ?? user.email ?? 'Usuario'

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-4 sm:p-6">
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-indigo-600 dark:text-indigo-400">
          <GraduationCap className="h-6 w-6" />
          Universidad
        </div>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <form action={logout}>
            <button className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-500/10 dark:hover:text-red-400">
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Cerrar sesión</span>
            </button>
          </form>
        </div>
      </header>

      <Link href="/profile" className="card flex items-center gap-4 p-4 transition hover:shadow-md sm:p-6">
        <Avatar name={name} path={profile?.avatar_path} size="lg" />
        <div className="min-w-0">
          <p className="muted text-sm">Bienvenido</p>
          <h1 className="truncate text-2xl font-bold tracking-tight">{name}</h1>
          <p className="muted truncate text-sm">{user.email}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        </div>
      </Link>

      <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />}>
        <RoleCards userId={user.id} roles={roles} />
      </Suspense>

      <p className="muted text-center text-xs">
        Aquí aparecerán tus cursos, horarios y notas cuando se active el módulo académico.
      </p>
    </main>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<p className="muted p-6 text-sm">Cargando...</p>}>
      <Home />
    </Suspense>
  )
}