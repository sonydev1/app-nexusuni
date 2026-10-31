import { connection } from 'next/server'
import { notFound } from 'next/navigation'
import InfoCard, { type InfoItem } from '@/components/info-card'
import StatusBadge from '@/components/status-badge'
import { STUDENT_STATUS_OPTIONS } from '@/lib/options'
import { getSessionAndRoles } from '@/utils/supabase/roles'
import { getUserDetail } from '../services/queries'
import UserDetailHeader from './user-detail-header'

const STATUS_LABELS = Object.fromEntries(STUDENT_STATUS_OPTIONS.map((o) => [o.value, o.label]))

// Se muestra cuando la persona ya no tiene el rol pero sus datos se conservan
function KeptBadge() {
  return (
    <StatusBadge title="La persona ya no tiene este rol; sus datos se conservan">
      Rol quitado
    </StatusBadge>
  )
}

export default async function UserDetail({ params }: { params: Promise<{ id: string }> }) {
  await connection()
  const { id } = await params

  const [{ user: currentUser }, detail] = await Promise.all([
    getSessionAndRoles(),
    getUserDetail(id),
  ])
  if (!detail) notFound()

  const has = (role: string) => detail.roles.includes(role)

  const account: InfoItem[] = [
    [
      'Estado',
      detail.disabled ? (
        <StatusBadge>Desactivada</StatusBadge>
      ) : (
        <StatusBadge tone="emerald">Activa</StatusBadge>
      ),
    ],
    ['Cuenta creada', detail.createdLabel],
    ['Último acceso', detail.lastSignIn || 'Nunca ha iniciado sesión'],
    [
      'Contraseña',
      detail.mustChangePassword ? (
        <StatusBadge tone="amber">Temporal, pendiente de cambio</StatusBadge>
      ) : (
        'Sin cambio pendiente'
      ),
    ],
  ]

  if (detail.deactivation) {
    account.push(
      ['Motivo de la desactivación', detail.deactivation.reason],
      ['Desactivada el', detail.deactivation.at],
      ['Desactivada por', detail.deactivation.by]
    )
  }

  return (
    <div className="space-y-6">
      <UserDetailHeader detail={detail} isSelf={currentUser?.id === detail.id} />

      <div className="grid gap-6 lg:grid-cols-2">
        <InfoCard
          title="Datos personales"
          items={[
            ['Correo', detail.email],
            ['Documento', detail.document],
            ['Teléfono', detail.phone],
            ['Fecha de nacimiento', detail.birthDate],
          ]}
        />
        <InfoCard title="Cuenta" items={account} />
      </div>

      {detail.student && (
        <InfoCard
          title="Estudiante"
          badge={!has('student') ? <KeptBadge /> : undefined}
          items={[
            ['Código estudiantil', detail.student.code],
            ['Estado', STATUS_LABELS[detail.student.status] ?? detail.student.status],
            ['Fecha de ingreso', detail.student.admissionDate],
          ]}
        />
      )}

      {detail.teacher && (
        <InfoCard
          title="Docente"
          badge={!has('teacher') ? <KeptBadge /> : undefined}
          items={[
            ['Código de empleado', detail.teacher.code],
            ['Especialidad', detail.teacher.specialty],
            ['Título académico', detail.teacher.degree],
            ['Fecha de contratación', detail.teacher.hireDate],
          ]}
        />
      )}

      {detail.staff && (
        <InfoCard
          title="Administrativo"
          badge={!has('staff') ? <KeptBadge /> : undefined}
          items={[
            ['Código de empleado', detail.staff.code],
            ['Cargo', detail.staff.position],
            ['Área', detail.staff.area],
            ['Fecha de contratación', detail.staff.hireDate],
          ]}
        />
      )}
    </div>
  )
}