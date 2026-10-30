import 'server-only'
import { connection } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import type { ProfileData } from '../types/profile-types'
import { redirect } from 'next/navigation';

export async function getProfileData(): Promise<ProfileData | null> {
  await connection()

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', user.id),
    supabase
      .from('profiles')
      .select('full_name, avatar_path, document_type, document_number, phone, birth_date, deactivated_at, must_change_password')
      .eq('id', user.id)
      .single(),
  ])

  if (profile?.deactivated_at) redirect('/auth/deactivated')
if (profile?.must_change_password) redirect('/change-password')

  return {
    id: user.id,
    email: user.email ?? '',
    name: profile?.full_name ?? user.email ?? 'Usuario',
    avatarPath: profile?.avatar_path ?? null,
    roles: (roles ?? []).map((r) => r.role as string),
    document: profile?.document_number
      ? `${profile.document_type} ${profile.document_number}`
      : '',
    phone: profile?.phone ?? '',
    // 'T00:00:00Z' + timeZone UTC evita que la fecha se corra un día
    birthDate: profile?.birth_date
      ? new Date(`${profile.birth_date}T00:00:00Z`).toLocaleDateString('es-CO', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          timeZone: 'UTC',
        })
      : '',
  }
}