import { connection } from 'next/server'
import { createClient } from './server'

export async function getSessionAndRoles() {
  await connection()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { user: null, roles: [] as string[], profile: null }
  }

  const [{ data: roles }, { data: profile }] = await Promise.all([
    supabase.from('user_roles').select('role').eq('user_id', user.id),
    supabase.from('profiles').select('full_name, avatar_path').eq('id', user.id).single(),
  ])

  return {
    user,
    roles: (roles ?? []).map((r) => r.role as string),
    profile,
  }
}