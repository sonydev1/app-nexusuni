import { redirect } from 'next/navigation'
import RoleBadge from '@/components/role-badge'
import { getProfileData } from '../services/queries'
import AvatarUploader from './avatar-uploader'

export default async function ProfileContent() {
  const data = await getProfileData()
  if (!data) redirect('/login')

  const details: [string, string][] = [
    ['Documento', data.document],
    ['Teléfono', data.phone],
    ['Fecha de nacimiento', data.birthDate],
  ]

  return (
    <div className="space-y-6">
      <section className="card space-y-6 p-4 sm:p-6">
        <AvatarUploader name={data.name} path={data.avatarPath} />

        <div className="space-y-1 border-t border-slate-200 pt-4 dark:border-slate-800">
          <p className="text-lg font-semibold">{data.name}</p>
          <p className="muted break-all text-sm">{data.email}</p>
          <div className="flex flex-wrap gap-1.5 pt-2">
            {data.roles.map((r) => (
              <RoleBadge key={r} role={r} />
            ))}
          </div>
        </div>
      </section>

      <section className="card p-4 sm:p-6">
        <h2 className="font-semibold">Datos personales</h2>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          {details.map(([label, value]) => (
            <div key={label}>
              <dt className="muted text-xs uppercase tracking-wide">{label}</dt>
              <dd className="mt-0.5 text-sm font-medium">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}