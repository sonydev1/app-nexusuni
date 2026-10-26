import 'server-only'
import { createClient } from '@/utils/supabase/server'

// Devuelve el usuario que llama si es admin; si no, null
export async function requireAdmin() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: isAdmin } = await supabase.rpc('has_role', { _role: 'admin' })
  return isAdmin ? user : null
}