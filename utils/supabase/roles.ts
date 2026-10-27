import { connection } from 'next/server'
import { createClient } from './server'
import { redirect } from 'next/navigation';

export async function getSessionAndRoles() {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, roles: [] as string[], profile: null }
  }

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', user.id),
    supabase.from('profiles').select('full_name, avatar_path, deactivated_at').eq('id', user.id).single(),
  ])
if (profile?.deactivated_at) redirect('/auth/deactivated')
  return {
    user,
    roles: (roles ?? []).map((r) => r.role as string),
    profile,
  }
}