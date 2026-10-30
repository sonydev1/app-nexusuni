import 'server-only'
import { cache } from 'react'
import { createClient } from '@/utils/supabase/server'

// Devuelve el usuario que llama si es admin activo; si no, null
export const requireAdmin = cache(async () => {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: isAdmin } = await supabase.rpc('has_role', { _role: 'admin' })
  return isAdmin ? user : null
})